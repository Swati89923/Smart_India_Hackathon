/**
 * marketService.js — what do similar products sell for on Indian marketplaces?
 *
 * Tries, in order:
 *   1. SerpAPI Google Shopping (SERPAPI_KEY)        → live prices + links (Flipkart, Amazon, Meesho…)
 *   2. Gemini with Google Search grounding           → needs a billed Gemini key; skipped for 30 min after a 429
 *   3. Gemini estimate from its own knowledge        → clearly labelled "not live"
 *
 * Results are cached in memory for an hour per product query so typing in the
 * cost fields doesn't trigger new searches.
 */

const env = (k) => (process.env[k] || "").trim();
const cache = new Map();
const CACHE_MS = 60 * 60 * 1000;
let groundingBlockedUntil = 0;

const MODELS = () => [...new Set([env("GEMINI_MODEL") || "gemini-3.6-flash", ...(env("GEMINI_FALLBACK_MODELS") || "gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.5-flash").split(",").map((m) => m.trim())])].filter(Boolean);

const round5 = (n) => Math.round(n / 5) * 5;
const quantile = (sorted, q) => {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

/** Summarise a list of prices, dropping extreme outliers (bundles, luxury pieces). */
function summarise(prices) {
  let s = prices.filter((p) => Number.isFinite(p) && p > 0).sort((a, b) => a - b);
  if (s.length >= 5) {
    const med = quantile(s, 0.5);
    s = s.filter((p) => p >= med / 4 && p <= med * 4);
  }
  if (!s.length) return null;
  return { low: round5(quantile(s, 0.25)), median: round5(quantile(s, 0.5)), high: round5(quantile(s, 0.75)), count: s.length };
}

function buildQuery({ title, craft, material }) {
  const base = (title || "").replace(/[—–-].*$/, "").trim() || `handmade ${craft}`;
  const mat = (material || "").split(",")[0].trim();
  const parts = [base];
  if (!/handmade|handcrafted|hand-made/i.test(base)) parts.push("handmade");
  if (mat && !base.toLowerCase().includes(mat.toLowerCase())) parts.push(mat);
  return parts.join(" ").slice(0, 120);
}

/* ---------- 1. SerpAPI Google Shopping ---------- */
async function fromSerpApi(query) {
  if (!env("SERPAPI_KEY")) return null;
  const url = `https://serpapi.com/search.json?engine=google_shopping&gl=in&hl=en&location=India&q=${encodeURIComponent(query)}&api_key=${env("SERPAPI_KEY")}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const j = await res.json();
    if (!res.ok || j.error) {
      console.warn("[market] SerpAPI:", j.error || res.status);
      return null;
    }
    const items = (j.shopping_results || [])
      .filter((r) => r.extracted_price)
      .slice(0, 12)
      .map((r) => ({ site: r.source || "Google Shopping", title: r.title, price: Math.round(r.extracted_price), url: r.product_link || r.link || null }));
    const stats = summarise(items.map((i) => i.price));
    return stats ? { ...stats, comparables: items.slice(0, 6), source: "google-shopping", live: true } : null;
  } catch (err) {
    console.warn("[market] SerpAPI failed:", err.message);
    return null;
  }
}

/* ---------- Gemini helpers (REST, so we can pass the google_search tool) ---------- */
async function gemini(model, prompt, { search = false } = {}) {
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0 } };
  if (search) body.tools = [{ google_search: {} }];
  else body.generationConfig.responseMimeType = "application/json";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });
  const j = await res.json();
  if (!res.ok) {
    const e = new Error(j.error?.message || `Gemini ${res.status}`);
    e.status = res.status;
    throw e;
  }
  const cand = j.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p) => p.text || "").join("");
  return { text, sources: (cand?.groundingMetadata?.groundingChunks || []).map((c) => ({ title: c.web?.title, url: c.web?.uri })).filter((s) => s.url) };
}

const parseJson = (text) => {
  const m = text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
};

const describe = ({ title, description, craft, material, category }) =>
  `Product: "${title || "handmade " + craft}"
Craft: ${craft || "handicraft"}; Category: ${category || "—"}; Material: ${material || "—"}
Description: ${(description || "").slice(0, 400)}`;

/* ---------- 2. Gemini + Google Search grounding ---------- */
async function fromGrounding(product) {
  if (!env("GEMINI_API_KEY") || Date.now() < groundingBlockedUntil) return null;
  const prompt = `Search Indian online marketplaces (Flipkart, Amazon.in, Meesho, Myntra, Etsy India, Jaypore, Okhai) for products SIMILAR to this handmade item and note their current selling prices in INR.
${describe(product)}

Compare like with like (same type of item, similar size/material; handmade where possible). Ignore bundles/sets of many pieces unless the product is a set.
Reply ONLY with JSON: {"comparables":[{"site":"Flipkart","title":"...","price":249}], "note":"one short sentence about the price range"}`;
  for (const model of MODELS()) {
    try {
      const { text, sources } = await gemini(model, prompt, { search: true });
      const out = parseJson(text);
      const items = (out?.comparables || []).filter((c) => Number(c.price) > 0).map((c) => ({ site: c.site || "Web", title: c.title || "", price: Math.round(Number(c.price)), url: null }));
      const stats = summarise(items.map((i) => i.price));
      if (!stats) continue;
      return { ...stats, comparables: items.slice(0, 6), sources: sources.slice(0, 6), note: out.note || "", source: "gemini-google-search", live: true, model };
    } catch (err) {
      if (err.status === 429 && /quota/i.test(err.message)) {
        groundingBlockedUntil = Date.now() + 30 * 60 * 1000; // free tier: search grounding not available
        console.warn("[market] Google Search grounding not available on this Gemini plan — using estimates");
        return null;
      }
      if (err.status === 503 || err.status === 429) continue;
      console.warn("[market] grounding failed:", err.message);
      return null;
    }
  }
  return null;
}

/* ---------- 3. Gemini estimate (no live search) ---------- */
async function fromEstimate(product) {
  if (!env("GEMINI_API_KEY")) return null;
  const prompt = `You are a pricing analyst for Indian e-commerce (Flipkart, Amazon.in, Meesho, Etsy India).
Estimate what products SIMILAR to this handmade item typically sell for online in India today, in INR.
${describe(product)}

Be realistic for the mass Indian market (most simple handmade accessories sell in the ₹99–₹999 range; premium artisan pieces cost more).
Return JSON: {"low": <25th percentile price>, "median": <typical price>, "high": <75th percentile price>,
"comparables":[{"site":"Flipkart","title":"typical similar listing","price":0}], "note":"one short sentence"}`;
  for (const model of MODELS()) {
    try {
      const { text } = await gemini(model, prompt);
      const out = parseJson(text);
      if (!out || !(out.median > 0)) continue;
      const items = (out.comparables || []).filter((c) => Number(c.price) > 0).slice(0, 5).map((c) => ({ site: c.site || "Typical", title: c.title || "", price: Math.round(Number(c.price)), url: null }));
      return {
        low: round5(out.low || out.median * 0.7), median: round5(out.median), high: round5(out.high || out.median * 1.4),
        count: items.length, comparables: items, note: out.note || "", source: "gemini-estimate", live: false, model,
      };
    } catch (err) {
      if (err.status === 503 || err.status === 429) continue;
      console.warn("[market] estimate failed:", err.message);
      return null;
    }
  }
  return null;
}

/**
 * @param {{title, description, craft, material, category}} product
 * @returns {Promise<null | {low, median, high, count, comparables, sources?, note, source, live, query}>}
 */
async function researchMarket(product) {
  const query = buildQuery(product);
  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = (await fromSerpApi(query)) || (await fromGrounding(product)) || (await fromEstimate(product));
  if (value) value.query = query;
  cache.set(key, { at: Date.now(), value });
  return value;
}

module.exports = { researchMarket };
