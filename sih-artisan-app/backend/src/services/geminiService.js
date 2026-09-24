const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * geminiService.js — all Gemini (Google AI Studio) calls.
 *
 *  - transcribeAudio          : artisan's voice note (Hindi / English / mixed) → full transcript + translations
 *  - analyzeProductImage      : identify the product in a photo + photo-quality feedback
 *  - generateMultimodalCatalogue : photo + transcript → bilingual marketplace listing
 *  - translateArtisanText     : free text → English
 *
 * Every function returns null when Gemini is not configured or the call
 * fails, so callers can fall back to the local templates.
 */

const MODEL = () => (process.env.GEMINI_MODEL || "gemini-3.6-flash").trim();
// Tried in order when the main model is overloaded (503) or rate-limited (429).
const FALLBACK_MODELS = () =>
  (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.5-flash")
    .split(",").map((m) => m.trim()).filter(Boolean);
const CRAFT_KEYS = ["pottery", "weaving", "painting", "jewelry", "woodwork", "embroidery"];

function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("your_gemini_api_key"));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTransient = (err) => /\b(429|500|503|504)\b|overloaded|high demand|UNAVAILABLE|fetch failed/i.test(String(err?.message || err));

// Models that just returned 503/429 are skipped for a while (simple circuit breaker).
const cooling = new Map();
const COOLDOWN_MS = 2 * 60 * 1000;

/**
 * Returns a runner `{ generate(parts) → { text, model } }` that moves to the
 * next model on transient errors instead of waiting on an overloaded one.
 */
// thinking: "minimal" | "low" | "high" — less thinking = much faster replies (3s vs 30s)
function getModel({ json = true, temperature = 0.3, thinking = "low" } = {}) {
  if (!isGeminiConfigured()) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  const base = { temperature, ...(json ? { responseMimeType: "application/json" } : {}) };
  const withThinking = thinking ? { ...base, thinkingConfig: { thinkingLevel: thinking } } : base;
  return {
    async generate(parts) {
      const all = [...new Set([MODEL(), ...FALLBACK_MODELS()])];
      const ready = all.filter((m) => (cooling.get(m) || 0) < Date.now());
      const order = ready.length ? [...ready, ...all.filter((m) => !ready.includes(m))] : all;
      let lastErr;
      for (const name of order) {
        try {
          const run = (generationConfig) =>
            genAI.getGenerativeModel({ model: name, generationConfig }, { timeout: 45000 }).generateContent(parts);
          let res;
          try {
            res = await run(withThinking);
          } catch (err) {
            // Some models don't accept thinkingConfig — retry once without it
            if (thinking && /thinking/i.test(String(err.message)) && !isTransient(err)) res = await run(base);
            else throw err;
          }
          cooling.delete(name);
          return { text: res.response.text(), model: name };
        } catch (err) {
          lastErr = err;
          if (!isTransient(err)) throw err;
          cooling.set(name, Date.now() + COOLDOWN_MS);
          console.warn(`[Gemini] ${name} busy, trying next model`);
          await sleep(200);
        }
      }
      throw lastErr;
    },
  };
}

const cleanBase64 = (b64 = "") => b64.replace(/^data:[\w/+.-]+;base64,/, "");
const imagePart = (b64, mimeType = "image/jpeg") => ({ inlineData: { data: cleanBase64(b64), mimeType } });

async function askJson(model, parts, label) {
  try {
    const { text, model: used } = await model.generate(parts);
    const out = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    return Object.assign(out, { _model: used });
  } catch (err) {
    console.warn(`[Gemini] ${label} failed:`, err.message || err);
    return null;
  }
}

/**
 * Transcribe an artisan's recorded voice note.
 * @returns {Promise<{transcript, language, english, hindi, source}|null>}
 */
async function transcribeAudio({ audioBase64, mimeType = "audio/webm", languageHint = "hi-IN", craft = "" }) {
  const model = getModel({ temperature: 0, thinking: "low" });
  if (!model || !audioBase64) return null;

  const prompt = `
You are a speech-to-text engine for Indian artisans describing their handmade products (craft: ${craft || "unknown"}).
The speaker most likely uses: ${languageHint} — but they may freely mix Hindi and English (Hinglish) or use another Indian language.

1. Transcribe EVERYTHING that is said, word for word, from start to end. Do not summarise, shorten or skip anything.
   Keep the original language: Hindi words in Devanagari script, English words in Latin script, other Indian languages in their own script.
2. Give a faithful, natural English translation of the whole transcript.
3. Give a faithful Hindi (Devanagari) version of the whole transcript.
If the audio is silent or unintelligible, return empty strings.

Return JSON: {"transcript": "...", "language": "hi | en | hi-en | <ISO code>", "english": "...", "hindi": "..."}
`;
  const out = await askJson(model, [prompt, { inlineData: { data: cleanBase64(audioBase64), mimeType } }], "transcribeAudio");
  if (!out) return null;
  return {
    transcript: (out.transcript || "").trim(),
    language: out.language || "",
    english: (out.english || "").trim(),
    hindi: (out.hindi || "").trim(),
    source: out._model,
  };
}

/**
 * Identify the product in the photo and assess photo quality.
 */
async function analyzeProductImage({ imageBase64, mimeType = "image/jpeg", craft = "" }) {
  const model = getModel({ temperature: 0.2, thinking: "minimal" });
  if (!model || !imageBase64) return null;

  const prompt = `
You are helping an Indian artisan list a handmade product online. The artisan said the craft is "${craft || "unknown"}".
Look carefully at the photo.
Return JSON:
{
  "identified": "short English name of what the product actually is (e.g. 'Hand-painted Madhubani clay vase')",
  "identifiedHi": "same in Hindi (Devanagari)",
  "craft": one of ${JSON.stringify(CRAFT_KEYS)} that best fits the product,
  "materials": "likely materials visible",
  "colors": ["main", "colours"],
  "lighting": "good" | "fair" | "dim",
  "backgroundClean": true | false,
  "isProductPhoto": true | false,
  "artisanTip": "one short tip in simple Hindi to take a better photo next time"
}
`;
  const out = await askJson(model, [prompt, imagePart(imageBase64, mimeType)], "analyzeProductImage");
  if (!out) return null;
  const { _model, ...rest } = out;
  return { ...rest, craft: CRAFT_KEYS.includes(out.craft) ? out.craft : craft, source: _model };
}

/**
 * Photo + artisan's own words → bilingual listing.
 */
async function generateMultimodalCatalogue({ craft = "pottery", imageBase64 = null, imageMimeType = "image/jpeg", voiceTranscript = "" }) {
  const model = getModel({ temperature: 0.3 });
  if (!model) return null;

  const prompt = `
You are ShilpSaathi's AI handicraft cataloguer for Indian artisans (PM Vishwakarma / ONDC).
Inputs:
- Craft chosen by the artisan: "${craft}"
- The artisan's own spoken description (may be Hindi, English or mixed): """${voiceTranscript || "None provided"}"""
- A photo of the product (if attached).

Rules:
- Describe THIS product only. Identify it from the photo; use the artisan's words for facts (materials, days of work, region, story, size, use).
- Never invent facts that contradict the photo or the artisan's words. If the artisan mentions something, include it.
- Warm, honest, commercial tone; 2-4 sentences per description.

Return JSON:
{
  "title": "English title",
  "titleHi": "हिंदी शीर्षक",
  "description": "English description",
  "descriptionHi": "हिंदी विवरण",
  "category": "Home Decor | Textile | Wall Art | Jewellery | Apparel | Kitchen & Dining | Furniture | Accessories | Handicraft",
  "craft": one of ${JSON.stringify(CRAFT_KEYS)},
  "materials": "main materials",
  "tags": ["5-7 search tags"]
}
`;
  const parts = [prompt];
  if (imageBase64) parts.push(imagePart(imageBase64, imageMimeType));
  const parsed = await askJson(model, parts, "generateCatalogue");
  if (!parsed) return null;
  return {
    title: parsed.title,
    titleHi: parsed.titleHi,
    description: parsed.description,
    descriptionHi: parsed.descriptionHi,
    category: parsed.category || "Handicraft",
    craft: CRAFT_KEYS.includes(parsed.craft) ? parsed.craft : craft,
    materials: parsed.materials || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    source: parsed._model,
  };
}

async function translateArtisanText({ text, craft = "pottery" }) {
  const model = getModel({ json: false, temperature: 0.2, thinking: "minimal" });
  if (!model || !text || !text.trim()) return null;
  try {
    const prompt = `Translate this Indian artisan's product description (craft: ${craft}) into natural English for a product listing.
Translate everything faithfully; keep traditional craft terms. Return ONLY the English text.

${text.trim()}`;
    const { text: out } = await model.generate(prompt);
    return out.trim();
  } catch (err) {
    console.warn("[Gemini] translate failed:", err.message || err);
    return null;
  }
}

module.exports = {
  isGeminiConfigured,
  geminiModel: MODEL,
  transcribeAudio,
  analyzeProductImage,
  generateMultimodalCatalogue,
  translateArtisanText,
};
