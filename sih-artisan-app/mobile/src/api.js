import axios from "axios";

/**
 * Point this at your backend.
 *  - iOS simulator:      http://localhost:4000/api
 *  - Android emulator:   http://10.0.2.2:4000/api
 *  - Web browser:        http://localhost:4000/api
 *  - Physical device:    http://<your-computer-LAN-IP>:4000/api
 */
export const API_BASE_URL = "http://localhost:4000/api";

const client = axios.create({ baseURL: API_BASE_URL, timeout: 6000 });

// ---- Offline-safe fallbacks --------------------------------------------
// If the backend isn't running, the app still works end-to-end using local mock logic.

const FALLBACK_TRANSCRIPTS = {
  pottery: "यह नीले रंग का हाथ से बना मिट्टी का फूलदान है, जयपुर की पारंपरिक ब्लू पॉटरी शैली में बनाया गया है।",
  weaving: "यह हाथ से बुना हुआ सूती दुपट्टा है, इसमें पारंपरिक बॉर्डर डिज़ाइन है।",
  painting: "यह मधुबनी शैली की पेंटिंग है, प्राकृतिक रंगों से हाथ से बनाई गई है।",
  jewelry: "यह चांदी की पारंपरिक बालियां हैं, हाथ से नक्काशी की गई हैं।",
  woodwork: "यह लकड़ी का हाथ से नक्काशीदार डिब्बा है, सागौन की लकड़ी से बना है।",
  embroidery: "यह हाथ से की गई चिकनकारी कढ़ाई वाला कुर्ता है, लखनऊ शैली में।",
};
const FALLBACK_EN = {
  pottery: "Handmade blue pottery vase, crafted in the traditional Jaipur style.",
  weaving: "Hand-woven cotton dupatta featuring a traditional border design.",
  painting: "Madhubani-style painting, hand-made using natural pigments.",
  jewelry: "Traditional hand-carved silver earrings.",
  woodwork: "Hand-carved wooden box made from teak wood.",
  embroidery: "Hand-done Chikankari embroidered kurta, Lucknow style.",
};
const FALLBACK_TITLE_EN = {
  pottery: "Blue Pottery Vase — Jaipur Style",
  weaving: "Hand-woven Cotton Dupatta",
  painting: "Madhubani Wall Art",
  jewelry: "Hand-carved Silver Earrings",
  woodwork: "Hand-carved Wooden Box",
  embroidery: "Chikankari Embroidered Kurta",
};
const FALLBACK_TITLE_HI = {
  pottery: "नीली मिट्टी का फूलदान",
  weaving: "हाथ से बुना सूती दुपट्टा",
  painting: "मधुबनी पेंटिंग",
  jewelry: "चांदी की बालियां",
  woodwork: "लकड़ी का डिब्बा",
  embroidery: "चिकनकारी कुर्ता",
};
const FALLBACK_CATEGORY = {
  pottery: "Home Decor", weaving: "Textile", painting: "Wall Art",
  jewelry: "Jewelry", woodwork: "Home Decor", embroidery: "Apparel",
};
const CRAFT_MARGIN = { pottery: 1.4, weaving: 1.55, painting: 1.8, jewelry: 2.2, woodwork: 1.6, embroidery: 1.5 };

export const SAMPLE_MARKETPLACE_PRODUCTS = [
  {
    id: "d2ad72f4-61fc-4d62-b820-a2e1f15c3d03",
    artisanId: "artisan-demo-001",
    artisanName: "Radha Devi",
    artisanLocation: "Khurja, Uttar Pradesh",
    pehchanId: "PEHCHAN-UP-88213",
    kycVerified: true,
    title: "Blue Pottery Vase — Jaipur Style",
    titleHi: "नीली मिट्टी का फूलदान",
    description: "Handmade blue pottery vase crafted in the traditional Jaipur style, using quartz clay and hand-painted floral motifs.",
    descriptionHi: "जयपुर की पारंपरिक ब्लू पॉटरी शैली में हाथ से बना फूलदान, क्वार्ट्ज मिट्टी और हाथ से चित्रित फूलों की कलाकृति के साथ।",
    craft: "pottery",
    category: "Home Decor",
    price: 650,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80",
    views: 214,
  },
  {
    id: "ce7a456f-afae-4e5a-9f36-f048ccfebfe1",
    artisanId: "artisan-demo-002",
    artisanName: "Shanti Ram",
    artisanLocation: "Varanasi, Uttar Pradesh",
    pehchanId: "PEHCHAN-UP-55104",
    kycVerified: true,
    title: "Hand-woven Banarasi Silk Dupatta",
    titleHi: "हाथ से बुना बनारसी दुपट्टा",
    description: "Authentic Varanasi handloom dupatta woven with fine silk threads and zari border.",
    descriptionHi: "प्राकृतिक रेशमी धागे और ज़री बॉर्डर से हाथ से बुना पारंपरिक बनारसी दुपट्टा।",
    craft: "weaving",
    category: "Textile",
    price: 1250,
    imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80",
    views: 185,
  },
  {
    id: "fa318c42-871d-4054-9a84-7517c5b65109",
    artisanId: "artisan-demo-001",
    artisanName: "Radha Devi",
    artisanLocation: "Khurja, Uttar Pradesh",
    pehchanId: "PEHCHAN-UP-88213",
    kycVerified: true,
    title: "Traditional Terracotta Water Pitcher",
    titleHi: "पारंपरिक मिट्टी का मटका",
    description: "Natural porous clay pitcher keeping water naturally cool, finished with ethnic etched lines.",
    descriptionHi: "प्राकृतिक मिट्टी से बना मटका जो पानी को ठंडा रखता है, पारंपरिक नक्काशी के साथ।",
    craft: "pottery",
    category: "Kitchen & Dining",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80",
    views: 94,
  },
  {
    id: "97f0a714-3864-4a41-b844-325b3ea70e28",
    artisanId: "artisan-demo-001",
    artisanName: "Radha Devi",
    artisanLocation: "Khurja, Uttar Pradesh",
    pehchanId: "PEHCHAN-UP-88213",
    kycVerified: true,
    title: "Madhubani Tree of Life Folk Art",
    titleHi: "मधुबनी ट्री ऑफ लाइफ पेंटिंग",
    description: "Handcrafted Madhubani wall art on handmade paper made with natural vegetable dyes.",
    descriptionHi: "प्राकृतिक रंगों से हस्तनिर्मित कागज़ पर बनी पारंपरिक मधुबनी पेंटिंग।",
    craft: "painting",
    category: "Wall Art",
    price: 1800,
    imageUrl: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=600&auto=format&fit=crop&q=80",
    views: 310,
  },
];

async function safeCall(fn, fallback) {
  try {
    const res = await fn();
    return res.data;
  } catch (e) {
    return fallback ? fallback() : null;
  }
}

// ---- Auth ----------------------------------------------------------------
export const sendOtp = (phone) =>
  safeCall(() => client.post("/auth/send-otp", { phone }), () => ({ sent: true, demoOtp: "1234" }));

export const verifyOtp = (phone, otp, role = "artisan", details = {}) =>
  safeCall(
    () => client.post("/auth/verify-otp", { phone, otp, role, ...details }),
    () => {
      if (role === "buyer") {
        const buyer = {
          id: "buyer-demo-001",
          name: details.name || "Rajiv Sharma",
          phone,
          companyName: details.companyName || "Rathi Exports",
          buyerType: details.buyerType || "Exporter",
          city: details.city || "New Delhi",
        };
        return { token: "demo-token-buyer", role: "buyer", buyer, artisan: buyer };
      }
      return {
        token: "demo-token-artisan",
        role: "artisan",
        artisan: {
          id: "artisan-demo-001",
          name: "Radha Devi",
          phone: "9876543210",
          craft: "pottery",
          location: "Khurja, Uttar Pradesh",
          pehchanId: "PEHCHAN-UP-88213",
          kycVerified: true,
        },
      };
    }
  );

// ---- Artisan profile -------------------------------------------------------
export const updateArtisan = (id, payload) =>
  safeCall(() => client.put(`/artisans/${id}`, payload), () => ({ id, ...payload, kycVerified: true }));

// ---- AI pipeline (Steps 2-5) ------------------------------------------------
export const checkAiStatus = () =>
  safeCall(
    () => client.get("/ai/status"),
    () => ({ geminiConfigured: false, model: "local-template-fallback" })
  );

export const enhanceImage = (craft, imageBase64 = null) =>
  safeCall(
    () => client.post("/ai/enhance", { craft, imageBase64 }),
    () => ({
      enhancedImageUrl: null,
      tags: ["background_removed", "lighting_fixed", "cropped_to_market_format"],
      lighting: "good",
    })
  );

export const transcribeVoice = (craft) =>
  safeCall(
    () => client.post("/ai/transcribe", { craft }),
    () => ({ transcriptHi: FALLBACK_TRANSCRIPTS[craft] || FALLBACK_TRANSCRIPTS.pottery, confidence: 0.9 })
  );

export const translateText = (text, craft) =>
  safeCall(
    () => client.post("/ai/translate", { text, craft }),
    () => ({ translatedText: FALLBACK_EN[craft] || FALLBACK_EN.pottery })
  );

export const generateCatalogue = (craft, imageBase64 = null, voiceTranscript = "") =>
  safeCall(
    () => client.post("/ai/catalogue", { craft, imageBase64, voiceTranscript }),
    () => ({
      title: FALLBACK_TITLE_EN[craft] || FALLBACK_TITLE_EN.pottery,
      titleHi: FALLBACK_TITLE_HI[craft] || FALLBACK_TITLE_HI.pottery,
      description: FALLBACK_EN[craft] || FALLBACK_EN.pottery,
      descriptionHi: FALLBACK_TRANSCRIPTS[craft] || FALLBACK_TRANSCRIPTS.pottery,
      category: FALLBACK_CATEGORY[craft] || "Handicraft",
      craft: craft || "pottery",
      materials: "Traditional natural materials",
      tags: ["handcrafted", "traditional", craft || "pottery", "artisan"],
      source: "local-template",
    })
  );


export const recommendPrice = (cost, craft) =>
  safeCall(
    () => client.post("/ai/price", { cost, craft }),
    () => {
      const margin = CRAFT_MARGIN[craft] || 1.5;
      const recommended = Math.round((cost * margin) / 5) * 5;
      return {
        min: Math.round((recommended * 0.85) / 5) * 5,
        recommended,
        max: Math.round((recommended * 1.25) / 5) * 5,
        basis: `Estimated from cost ₹${cost} × craft margin (${margin}) — connect the backend for live market-trend data.`,
      };
    }
  );

// ---- Products / storefront --------------------------------------------------
export const publishProduct = (payload) =>
  safeCall(() => client.post("/products", payload), () => ({ id: `local-${Date.now()}`, ...payload, views: 0, status: "published" }));

export const listProducts = (artisanId) =>
  safeCall(() => client.get("/products", { params: { artisanId } }), () => SAMPLE_MARKETPLACE_PRODUCTS.filter(p => !artisanId || p.artisanId === artisanId));

export const listMarketplaceProducts = (craft, search) =>
  safeCall(
    () => client.get("/products", { params: { craft, search } }),
    () => {
      let prods = [...SAMPLE_MARKETPLACE_PRODUCTS];
      if (craft && craft !== "all") {
        prods = prods.filter(p => p.craft === craft);
      }
      if (search) {
        const s = search.toLowerCase();
        prods = prods.filter(p => p.title.toLowerCase().includes(s) || (p.titleHi && p.titleHi.includes(s)));
      }
      return prods;
    }
  );

// ---- Buyer enquiries & negotiation --------------------------------------------
export const listEnquiries = (artisanId) =>
  safeCall(() => client.get("/enquiries", { params: { artisanId } }), () => []);

export const listBuyerEnquiries = (buyerId, buyerPhone) =>
  safeCall(() => client.get("/enquiries", { params: { buyerId, buyerPhone } }), () => []);

export const createBuyerEnquiry = (payload) =>
  safeCall(
    () => client.post("/enquiries", payload),
    () => ({
      id: `enquiry-${Date.now()}`,
      ...payload,
      status: payload.initialOfferPrice ? "negotiating" : "open",
      createdAt: new Date().toISOString(),
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: "buyer",
          message: payload.initialMessage || `Offer sent: ₹${payload.initialOfferPrice}/piece for ${payload.quantity} pieces.`,
          offerPrice: payload.initialOfferPrice ? Number(payload.initialOfferPrice) : null,
          time: new Date().toISOString(),
        }
      ],
    })
  );

export const sendNegotiationMessage = (enquiryId, sender, message, offerPrice) =>
  safeCall(
    () => client.post(`/enquiries/${enquiryId}/message`, { sender, message, offerPrice }),
    () => null
  );

export const suggestResponse = (enquiryId) =>
  safeCall(
    () => client.get(`/enquiries/${enquiryId}/suggest-response`),
    () => ({ action: "counter", suggestedPrice: 580, note: "Protects margin while splitting difference." })
  );

export const respondToEnquiry = (enquiryId, action, price, message) =>
  safeCall(
    () => client.post(`/enquiries/${enquiryId}/respond`, { action, price, message }),
    () => null
  );

export const confirmDeal = (enquiryId, payload) =>
  safeCall(
    () => client.post(`/enquiries/${enquiryId}/deal`, payload),
    () => ({ id: enquiryId, status: "deal_closed", ...payload })
  );
