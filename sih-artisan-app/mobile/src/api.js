/**
 * Mobile API client for the ShilpSaathi Express backend (../backend, port 4000).
 * Kept in sync with web/src/api.js — same endpoints, same offline fallbacks.
 *
 * Every call has an offline-safe fallback: if the backend is unreachable
 * (network error / 5xx) the app keeps working end-to-end on an in-memory
 * copy of the seed data (./sampleData.js).
 * 4xx responses (wrong OTP, bad admin password, …) are real errors and are thrown.
 */
import {
  SAMPLE_ARTISANS, SAMPLE_BUYERS, SAMPLE_PRODUCTS, SAMPLE_ENQUIRIES, SAMPLE_SETTINGS,
  FALLBACK_TRANSCRIPTS, FALLBACK_EN, FALLBACK_TITLE_EN, FALLBACK_TITLE_HI, FALLBACK_CATEGORY,
  CRAFT_MARGIN, MARKET_TREND_INDEX,
} from "./sampleData";

import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Backend URL. Set EXPO_PUBLIC_API_BASE_URL in mobile/.env to override.
 * Otherwise, on a phone running Expo Go we reuse the laptop's LAN IP from
 * the Expo dev server (e.g. 192.168.1.15:8081 → http://192.168.1.15:4000/api).
 */
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  const host = (Constants.expoConfig?.hostUri || "").split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") return `http://${host}:4000/api`;
  if (Platform.OS === "android") return "http://10.0.2.2:4000/api"; // Android emulator → host machine
  return "http://localhost:4000/api";
}
export const API_BASE_URL = resolveBaseUrl();

// ---- connectivity status (drives the "Offline demo" pill) ------------------
let offline = false;
const listeners = new Set();
const setOffline = (v) => {
  if (offline !== v) {
    offline = v;
    listeners.forEach((fn) => fn(v));
  }
};
export const isOffline = () => offline;
export const onConnectivity = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

class ApiError extends Error {}
const clone = (v) => JSON.parse(JSON.stringify(v));

async function call(method, path, body, fallback, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(API_BASE_URL + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.status >= 500) throw new Error(`Server ${res.status}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(json.error || `Request failed (${res.status})`);
    setOffline(false);
    return json;
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof ApiError) throw e;
    setOffline(true);
    if (!fallback) throw e;
    return fallback();
  }
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
  return s ? `?${s}` : "";
};

// ---- in-memory offline store ------------------------------------------------
const local = {
  artisans: clone(SAMPLE_ARTISANS),
  buyers: clone(SAMPLE_BUYERS),
  products: clone(SAMPLE_PRODUCTS),
  enquiries: clone(SAMPLE_ENQUIRIES),
  settings: clone(SAMPLE_SETTINGS),
};
const uid = (p) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
const round5 = (n) => Math.round(n / 5) * 5;

const enrich = (prod) => {
  const a = local.artisans.find((x) => x.id === prod.artisanId) || {};
  return {
    ...prod,
    artisanName: a.name || "Master Artisan",
    artisanLocation: a.location || "India",
    artisanState: a.state || "",
    artisanBio: a.bio || "",
    pehchanId: a.pehchanId || "PEHCHAN-VERIFIED",
    kycVerified: a.kycVerified ?? true,
  };
};
const findEnquiry = (id) => local.enquiries.find((e) => e.id === id);
const pushMsg = (enq, sender, message, offerPrice) => {
  enq.thread.push({ id: uid("msg"), sender, message, offerPrice: offerPrice ?? null, time: new Date().toISOString() });
  return clone(enq);
};

// ---- Auth ---------------------------------------------------------------------
export const sendOtp = (phone) => call("POST", "/auth/send-otp", { phone }, () => ({ sent: true, demoOtp: "1234" }));

export const verifyOtp = (phone, otp, role = "artisan", details = {}) =>
  call("POST", "/auth/verify-otp", { phone, otp, role, ...details }, () => {
    if (otp !== "1234") throw new ApiError("Invalid OTP");
    if (role === "buyer") {
      let buyer = local.buyers.find((b) => b.phone === phone);
      if (!buyer) {
        buyer = { id: uid("buyer"), name: details.name || "Demo Buyer", phone, buyerType: details.buyerType || "Retailer", companyName: details.companyName || "Craft Retailers Co.", city: details.city || "New Delhi" };
        local.buyers.push(buyer);
      }
      return { token: "demo-token-buyer", role: "buyer", buyer };
    }
    let artisan = local.artisans.find((a) => a.phone === phone);
    if (!artisan) {
      artisan = { id: uid("artisan"), name: details.name || "", phone, craft: "", location: "", pehchanId: "", kycVerified: false, language: "hi", createdAt: new Date().toISOString() };
      local.artisans.push(artisan);
    }
    return { token: "demo-token-artisan", role: "artisan", artisan };
  });

export const updateBuyer = (id, payload) =>
  call("PATCH", `/auth/buyer/${id}`, payload, () => {
    const b = local.buyers.find((x) => x.id === id);
    Object.assign(b || {}, payload);
    return { ok: true, buyer: { id, ...b, ...payload } };
  });

export const adminLogin = (email, password) =>
  call("POST", "/admin/login", { email, password }, () => {
    if (email !== "admin@shilpsaathi.gov.in" || password !== "admin123") throw new ApiError("Invalid admin credentials");
    return { token: "demo-token-admin", role: "admin", admin: { name: "Platform Admin", email } };
  });

// ---- Artisans -------------------------------------------------------------------
export const getArtisan = (id) =>
  call("GET", `/artisans/${id}`, null, () => {
    const a = local.artisans.find((x) => x.id === id);
    if (!a) throw new ApiError("Artisan not found");
    return clone(a);
  });

export const updateArtisan = (id, payload) =>
  call("PUT", `/artisans/${id}`, payload, () => {
    let a = local.artisans.find((x) => x.id === id);
    if (!a) {
      a = { id };
      local.artisans.push(a);
    }
    Object.assign(a, payload);
    a.kycVerified = !!(a.name && a.craft && a.location);
    return clone(a);
  });

// ---- AI pipeline -------------------------------------------------------------------
const AI = { timeout: 90000 }; // real AI calls (Gemini / remove.bg) can take 10-40s

export const aiStatus = () =>
  call("GET", "/ai/status", null, () => ({ geminiConfigured: false, removeBgConfigured: false, cloudinaryConfigured: false, model: "offline" }));

/** Real enhancement: remove.bg + Cloudinary + Gemini identification (backend). */
export const enhanceImage = (craft, imageBase64, { identify = true } = {}) =>
  call("POST", "/ai/enhance", { craft, imageBase64, identify }, () => ({
    enhancedImageUrl: null,
    tags: ["lighting_fixed", "cropped_to_market_format"],
    source: "local-filter",
  }), AI);

/** Gemini vision: what product is in the photo (+ photo tip). */
export const identifyProduct = (craft, imageBase64) =>
  call("POST", "/ai/identify", { craft, imageBase64 }, () => ({ source: "unavailable" }), AI);

/** Speech-to-text. Pass { audioBase64, mimeType, languageHint } for a real transcription. */
export const transcribeVoice = (craft, audio = {}) =>
  call("POST", "/ai/transcribe", { craft, ...audio }, () => ({
    transcriptHi: FALLBACK_TRANSCRIPTS[craft] || FALLBACK_TRANSCRIPTS.pottery,
    transcript: FALLBACK_TRANSCRIPTS[craft] || FALLBACK_TRANSCRIPTS.pottery,
    english: FALLBACK_EN[craft] || FALLBACK_EN.pottery,
    confidence: 0.9,
    source: "demo-sample",
  }), AI);

export const translateText = (text, craft) =>
  call("POST", "/ai/translate", { text, craft }, () => ({
    translatedText: text && text !== FALLBACK_TRANSCRIPTS[craft] ? text : FALLBACK_EN[craft] || FALLBACK_EN.pottery,
  }), AI);

export const generateCatalogue = (craft, imageBase64, voiceTranscript = "") =>
  call("POST", "/ai/catalogue", { craft, imageBase64, imageMimeType: "image/jpeg", voiceTranscript }, () => ({
    title: FALLBACK_TITLE_EN[craft] || FALLBACK_TITLE_EN.pottery,
    titleHi: FALLBACK_TITLE_HI[craft] || FALLBACK_TITLE_HI.pottery,
    description: FALLBACK_EN[craft] || FALLBACK_EN.pottery,
    descriptionHi: voiceTranscript || FALLBACK_TRANSCRIPTS[craft] || FALLBACK_TRANSCRIPTS.pottery,
    category: FALLBACK_CATEGORY[craft] || "Handicraft",
    craft,
    materials: "Traditional natural materials",
    tags: ["handcrafted", "traditional", craft, "artisan"],
    source: "local-template",
  }), AI);

export const recommendPrice = (cost, craft) =>
  call("POST", "/ai/price", { cost, craft }, () => {
    const margin = CRAFT_MARGIN[craft] || 1.5;
    const trend = MARKET_TREND_INDEX[craft] || 1.0;
    const recommended = round5(cost * margin * trend);
    const min = round5(recommended * 0.85);
    const max = round5(recommended * 1.25);
    return {
      min,
      recommended,
      max,
      basis: `Cost ₹${cost} × craft margin (${margin}) × market-trend index (${trend}) for "${craft}". Similar items in this cluster sold in the ₹${min}–₹${max} range recently.`,
    };
  });

// ---- Products ------------------------------------------------------------------------
export const listProducts = ({ artisanId, craft, search } = {}) =>
  call("GET", `/products${qs({ artisanId, craft, search })}`, null, () => {
    let list = artisanId ? local.products.filter((x) => x.artisanId === artisanId) : local.products.filter((x) => x.status === "published");
    if (craft && craft !== "all") list = list.filter((x) => x.craft === craft);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((x) => [x.title, x.titleHi, x.category, x.craft, enrich(x).artisanName].some((f) => (f || "").toLowerCase().includes(s)));
    }
    return list.map(enrich);
  });

export const getProduct = (id) =>
  call("GET", `/products/${id}`, null, () => {
    const prod = local.products.find((x) => x.id === id);
    if (!prod) throw new ApiError("Product not found");
    return enrich(prod);
  });

export const publishProduct = (payload) =>
  call("POST", "/products", payload, () => {
    const prod = { id: uid("prod"), views: 0, status: "published", createdAt: new Date().toISOString(), ...payload };
    local.products.unshift(prod);
    return prod;
  });

export const updateProduct = (id, payload) =>
  call("PATCH", `/products/${id}`, payload, () => {
    const prod = local.products.find((x) => x.id === id);
    Object.assign(prod || {}, payload);
    return prod;
  });

// ---- Enquiries & negotiation ---------------------------------------------------------------
export const listEnquiries = ({ artisanId, buyerId, buyerPhone } = {}) =>
  call("GET", `/enquiries${qs({ artisanId, buyerId, buyerPhone })}`, null, () =>
    clone(
      local.enquiries.filter((e) =>
        artisanId ? e.artisanId === artisanId : buyerId ? e.buyerId === buyerId || (buyerPhone && e.buyerPhone === buyerPhone) : true
      )
    )
  );

export const getEnquiry = (id) =>
  call("GET", `/enquiries/${id}`, null, () => {
    const e = findEnquiry(id);
    if (!e) throw new ApiError("Enquiry not found");
    return clone(e);
  });

export const createEnquiry = (payload) =>
  call("POST", "/enquiries", payload, () => {
    const qty = Number(payload.quantity) || 1;
    const offer = payload.initialOfferPrice ? Number(payload.initialOfferPrice) : null;
    const e = {
      id: uid("enq"),
      ...payload,
      quantity: qty,
      askingPrice: Number(payload.askingPrice),
      status: offer ? "negotiating" : "open",
      createdAt: new Date().toISOString(),
      thread: [],
    };
    pushMsg(e, "buyer", payload.initialMessage || (offer ? `Offer sent: ₹${offer}/piece for ${qty} pieces.` : `Interested in ordering ${qty} pieces.`), offer);
    local.enquiries.unshift(e);
    return clone(e);
  });

export const sendMessage = (id, sender, message, offerPrice) =>
  call("POST", `/enquiries/${id}/message`, { sender, message, offerPrice }, () => {
    const e = findEnquiry(id);
    if (e.status !== "deal_closed") e.status = "negotiating";
    return pushMsg(e, sender, message, offerPrice != null && offerPrice !== "" ? Number(offerPrice) : null);
  });

export const suggestResponse = (id) =>
  call("GET", `/enquiries/${id}/suggest-response`, null, () => {
    const e = findEnquiry(id);
    const last = e && [...e.thread].reverse().find((m) => m.offerPrice != null);
    if (!last) return { action: "none", note: "No offer to respond to yet." };
    const ratio = last.offerPrice / e.askingPrice;
    if (ratio >= 0.9)
      return { action: "accept", suggestedPrice: last.offerPrice, note: `This offer is within 10% of your asking price and the order size (${e.quantity}) is healthy — accepting keeps the relationship strong.` };
    const counter = round5((e.askingPrice + last.offerPrice) / 2);
    return { action: "counter", suggestedPrice: counter, note: `The offer is ${Math.round((1 - ratio) * 100)}% below your asking price. A counter at ₹${counter}/piece splits the difference while protecting your margin.` };
  });

export const respondToEnquiry = (id, action, price, message) =>
  call("POST", `/enquiries/${id}/respond`, { action, price, message }, () => {
    const e = findEnquiry(id);
    e.status = action === "accept" ? "accepted" : action === "reject" ? "declined" : "negotiating";
    return pushMsg(
      e,
      "artisan",
      message || (action === "accept" ? `Accepted at ₹${price}/piece.` : action === "counter" ? `Countered at ₹${price}/piece.` : "Declined this offer."),
      action === "reject" ? null : price
    );
  });

export const confirmDeal = (id, { finalPrice, address, paymentMode = "Escrow / Cash on Delivery" }) =>
  call("POST", `/enquiries/${id}/deal`, { finalPrice, address, paymentMode }, () => {
    const e = findEnquiry(id);
    const price = finalPrice != null ? Number(finalPrice) : e.askingPrice;
    e.status = "deal_closed";
    e.finalPrice = price;
    e.totalAmount = price * e.quantity;
    return pushMsg(e, "buyer", `🤝 Deal Confirmed! Agreed at ₹${price}/piece for ${e.quantity} items (Total: ₹${e.totalAmount}). Payment: ${paymentMode}. Delivery: ${address || "Default Address"}.`, price);
  });

// ---- Admin ------------------------------------------------------------------------------------
const artisanStatus = (a) => a.status || (a.kycVerified ? "active" : "pending");
const artisanState = (a) => a.state || (a.location || "").split(",").pop().trim() || "Unknown";

export const adminOverview = () =>
  call("GET", "/admin/overview", null, () => {
    const { artisans, products, enquiries } = local;
    const now = new Date();
    const growth = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      growth.push({
        label: new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString("en-IN", { month: "short" }),
        artisans: artisans.filter((a) => new Date(a.createdAt || now) < end).length,
        products: products.filter((x) => new Date(x.createdAt || now) < end).length,
      });
    }
    const countBy = (items, fn) =>
      Object.entries(items.reduce((acc, it) => ((acc[fn(it)] = (acc[fn(it)] || 0) + 1), acc), {}))
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    return {
      totals: {
        artisans: artisans.length,
        activeArtisans: artisans.filter((a) => artisanStatus(a) === "active").length,
        pendingArtisans: artisans.filter((a) => artisanStatus(a) === "pending").length,
        products: products.length,
        activeProducts: products.filter((x) => (x.status || "published") === "published").length,
        buyers: local.buyers.length,
        enquiries: enquiries.length,
        dealsClosed: enquiries.filter((e) => e.status === "deal_closed").length,
        gmv: enquiries.reduce((s, e) => s + (e.totalAmount || 0), 0),
        languages: new Set(artisans.map((a) => a.language || "hi")).size,
      },
      growth,
      artisansByState: countBy(artisans, artisanState),
      productsByCraft: countBy(products, (x) => x.craft || "other"),
    };
  });

export const adminArtisans = () =>
  call("GET", "/admin/artisans", null, () =>
    local.artisans.map((a) => ({ ...a, state: artisanState(a), status: artisanStatus(a), productCount: local.products.filter((x) => x.artisanId === a.id).length }))
  );

export const adminUpdateArtisan = (id, status) =>
  call("PATCH", `/admin/artisans/${id}`, { status }, () => {
    const a = local.artisans.find((x) => x.id === id);
    a.status = status;
    if (status === "active") a.kycVerified = true;
    return { ...a, state: artisanState(a) };
  });

export const adminProducts = () =>
  call("GET", "/admin/products", null, () =>
    local.products.map((x) => {
      const a = local.artisans.find((y) => y.id === x.artisanId) || {};
      return { ...x, artisanName: a.name || "—", artisanState: artisanState(a), status: x.status || "published" };
    })
  );

export const adminUpdateProduct = (id, status) =>
  call("PATCH", `/admin/products/${id}`, { status }, () => {
    const x = local.products.find((y) => y.id === id);
    x.status = status;
    return x;
  });

export const getSettings = () => call("GET", "/admin/settings", null, () => clone(local.settings));

export const saveSettings = (payload) =>
  call("PUT", "/admin/settings", payload, () => Object.assign(local.settings, payload));
