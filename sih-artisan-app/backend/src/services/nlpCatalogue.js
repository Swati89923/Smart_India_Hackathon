/**
 * nlpCatalogue.js
 *
 * Stands in for two blocks in the system diagram:
 *   - Speech-to-Text (Regional-Language Voice Input)
 *   - Language/NLP (Translate + Generate Catalogue)
 *
 * In production these would call a multilingual ASR model (e.g.
 * Bhashini / Whisper fine-tuned for Indian languages) and an
 * LLM prompted to produce a bilingual, structured catalogue entry
 * from the raw transcript. For the prototype we simulate both
 * steps deterministically so the full pipeline can be demoed
 * offline, with no API keys required.
 */

const SAMPLE_TRANSCRIPTS = {
  pottery:
    "यह नीले रंग का हाथ से बना मिट्टी का फूलदान है, जयपुर की पारंपरिक ब्लू पॉटरी शैली में बनाया गया है।",
  weaving:
    "यह हाथ से बुना हुआ सूती दुपट्टा है, इसमें पारंपरिक बॉर्डर डिज़ाइन है।",
  painting:
    "यह मधुबनी शैली की पेंटिंग है, प्राकृतिक रंगों से हाथ से बनाई गई है।",
  jewelry:
    "यह चांदी की पारंपरिक बालियां हैं, हाथ से नक्काशी की गई हैं।",
  woodwork:
    "यह लकड़ी का हाथ से नक्काशीदार डिब्बा है, सागौन की लकड़ी से बना है।",
  embroidery:
    "यह हाथ से की गई चिकनकारी कढ़ाई वाला कुर्ता है, लखनऊ शैली में।",
};

const EN_TEMPLATES = {
  pottery: "Handmade blue pottery vase, crafted in the traditional Jaipur style.",
  weaving: "Hand-woven cotton dupatta featuring a traditional border design.",
  painting: "Madhubani-style painting, hand-made using natural pigments.",
  jewelry: "Traditional hand-carved silver earrings.",
  woodwork: "Hand-carved wooden box made from teak wood.",
  embroidery: "Hand-done Chikankari embroidered kurta, Lucknow style.",
};

const CATEGORY_BY_CRAFT = {
  pottery: "Home Decor",
  weaving: "Textile",
  painting: "Wall Art",
  jewelry: "Jewelry",
  woodwork: "Home Decor",
  embroidery: "Apparel",
};

const TITLE_EN = {
  pottery: "Blue Pottery Vase — Jaipur Style",
  weaving: "Hand-woven Cotton Dupatta",
  painting: "Madhubani Wall Art",
  jewelry: "Hand-carved Silver Earrings",
  woodwork: "Hand-carved Wooden Box",
  embroidery: "Chikankari Embroidered Kurta",
};

const TITLE_HI = {
  pottery: "नीली मिट्टी का फूलदान",
  weaving: "हाथ से बुना सूती दुपट्टा",
  painting: "मधुबनी पेंटिंग",
  jewelry: "चांदी की बालियां",
  woodwork: "लकड़ी का डिब्बा",
  embroidery: "चिकनकारी कुर्ता",
};

const {
  generateMultimodalCatalogue,
  analyzeProductImage,
  translateArtisanText,
  transcribeAudio,
} = require("./geminiService");
const { enhanceProductPhoto } = require("./imageService");

/**
 * Speech-to-text. With a recorded audio clip + Gemini configured this is a
 * real, full transcription (Hindi / English / mixed); otherwise it falls
 * back to typed text or the demo transcript for the craft.
 */
async function transcribeVoiceNote({ craft = "pottery", text = null, audioBase64 = null, mimeType, languageHint } = {}) {
  if (audioBase64) {
    const ai = await transcribeAudio({ audioBase64, mimeType, languageHint, craft });
    if (ai && ai.transcript) {
      return {
        transcriptHi: ai.transcript, // kept for older clients: the transcript in the language spoken
        transcript: ai.transcript,
        english: ai.english,
        hindi: ai.hindi,
        language: ai.language,
        confidence: 0.95,
        source: ai.source,
      };
    }
    if (ai && !ai.transcript) {
      return { transcriptHi: "", transcript: "", english: "", hindi: "", confidence: 0, source: ai.source, empty: true };
    }
  }
  if (text && text.trim()) {
    return { transcriptHi: text.trim(), transcript: text.trim(), confidence: 0.98, source: "typed" };
  }
  const sample = SAMPLE_TRANSCRIPTS[craft] || SAMPLE_TRANSCRIPTS.pottery;
  return { transcriptHi: sample, transcript: sample, english: EN_TEMPLATES[craft] || EN_TEMPLATES.pottery, confidence: 0.93, source: "demo-sample" };
}

async function translateText({ text, craft = "pottery" }) {
  if (text && text.trim()) {
    const aiTranslation = await translateArtisanText({ text, craft });
    if (aiTranslation) {
      return { translatedText: aiTranslation };
    }
    // If text matches sample transcript, use template, otherwise return text
    if (SAMPLE_TRANSCRIPTS[craft] && text.trim() === SAMPLE_TRANSCRIPTS[craft].trim()) {
      return { translatedText: EN_TEMPLATES[craft] || text };
    }
    return { translatedText: text };
  }
  return { translatedText: EN_TEMPLATES[craft] || EN_TEMPLATES.pottery };
}

async function generateCatalogue({
  craft = "pottery",
  imageBase64 = null,
  imageMimeType = "image/jpeg",
  voiceTranscript = "",
} = {}) {
  // Attempt live Multimodal Gemini AI generation first
  const aiResult = await generateMultimodalCatalogue({
    craft,
    imageBase64,
    imageMimeType,
    voiceTranscript,
  });

  if (aiResult) {
    return aiResult;
  }

  // Graceful deterministic fallback
  return {
    title: TITLE_EN[craft] || TITLE_EN.pottery,
    titleHi: TITLE_HI[craft] || TITLE_HI.pottery,
    description: EN_TEMPLATES[craft] || EN_TEMPLATES.pottery,
    descriptionHi: SAMPLE_TRANSCRIPTS[craft] || SAMPLE_TRANSCRIPTS.pottery,
    category: CATEGORY_BY_CRAFT[craft] || "Handicraft",
    craft,
    materials: "Traditional natural materials",
    tags: ["handcrafted", "traditional", craft, "artisan"],
    source: "local-template",
  };
}

/**
 * Real enhancement (remove.bg + Cloudinary). Set `identify: true` to also run
 * Gemini product identification in the same call (slower); the web client
 * calls identifyProduct separately so the clean photo shows up sooner.
 */
async function enhanceImage({ craft = "pottery", imageBase64 = null, identify = true } = {}) {
  if (imageBase64) {
    const [photo, analysis] = await Promise.all([
      enhanceProductPhoto(imageBase64),
      identify ? identifyProduct({ craft, imageBase64 }) : null,
    ]);
    if (photo.enhancedImageUrl || analysis) {
      return {
        ...photo,
        ...(analysis || {}),
        source: [photo.backgroundRemoved && "remove.bg", photo.stored && "cloudinary", analysis && analysis.source].filter(Boolean).join(" + ") || "local",
      };
    }
  }

  return {
    enhancedImageUrl: null,
    tags: ["lighting_fixed", "cropped_to_market_format"],
    lighting: "good",
    source: "local-filter",
  };
}

/** Gemini: what is in the photo + photo-quality tip. Returns null without Gemini. */
async function identifyProduct({ craft = "pottery", imageBase64 }) {
  const a = await analyzeProductImage({ imageBase64, craft });
  if (!a) return null;
  return {
    lighting: a.lighting || null,
    artisanTip: a.artisanTip || "",
    identified: a.identified || "",
    identifiedHi: a.identifiedHi || "",
    detectedCraft: a.craft || null,
    materials: a.materials || "",
    colors: a.colors || [],
    isProductPhoto: a.isProductPhoto ?? true,
    source: a.source,
  };
}

module.exports = { transcribeVoiceNote, translateText, generateCatalogue, enhanceImage, identifyProduct };
