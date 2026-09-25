const express = require("express");
const {
  transcribeVoiceNote,
  translateText,
  generateCatalogue,
  enhanceImage,
  identifyProduct,
} = require("../services/nlpCatalogue");
const { recommendPrice, recommendMarketPrice } = require("../services/pricingModel");
const { researchMarket } = require("../services/marketService");
const { isGeminiConfigured, geminiModel } = require("../services/geminiService");
const { isRemoveBgConfigured, isCloudinaryConfigured } = require("../services/imageService");

const router = express.Router();

// Check AI Service status
router.get("/status", (req, res) => {
  res.json({
    geminiConfigured: isGeminiConfigured(),
    removeBgConfigured: isRemoveBgConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
    model: isGeminiConfigured() ? geminiModel() : "local-template-fallback",
    capabilities: [
      "multimodal_catalogue_generation",
      "image_quality_analysis",
      "bilingual_storytelling",
      "market_pricing_engine",
    ],
  });
});

// Step 2 — Enhance Image (Image AI: background removal + quality check)
router.post("/enhance", async (req, res, next) => {
  try {
    const { craft, imageBase64, identify, description } = req.body;
    const result = await enhanceImage({ craft, imageBase64, identify: identify !== false, description });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Identify the product in a photo (Gemini vision) — Body: { craft, imageBase64 }
router.post("/identify", async (req, res, next) => {
  try {
    const { craft, imageBase64, description } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 is required" });
    res.json((await identifyProduct({ craft, imageBase64, description })) || { source: "unavailable" });
  } catch (err) {
    next(err);
  }
});

// Step 3 — Describe by Voice (Speech-to-Text: regional-language voice input)
// Body: { craft, audioBase64?, mimeType?, languageHint?, text? }
router.post("/transcribe", async (req, res, next) => {
  try {
    const { craft, audioBase64, mimeType, languageHint, text } = req.body;
    res.json(await transcribeVoiceNote({ craft, audioBase64, mimeType, languageHint, text }));
  } catch (err) {
    next(err);
  }
});

// Optional helper used by the "show English translation" toggle
router.post("/translate", async (req, res, next) => {
  try {
    const { text, craft } = req.body;
    res.json(await translateText({ text, craft }));
  } catch (err) {
    next(err);
  }
});

// Step 4 — Generate Catalogue (Multimodal VLM: image + voice -> rich bilingual listing)
router.post("/catalogue", async (req, res, next) => {
  try {
    const { craft, imageBase64, imageMimeType, voiceTranscript } = req.body;
    const result = await generateCatalogue({
      craft,
      imageBase64,
      imageMimeType,
      voiceTranscript,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Step 5 — Recommend Price.
// Body: { cost?, craft, title?, description?, material?, category? }
// With product details → anchored to what similar items sell for online (Flipkart/Amazon/Meesho…),
// never below cost + 15%. Without details → the transparent cost-plus formula (old behaviour).
router.post("/price", async (req, res, next) => {
  try {
    const { cost, craft, title, description, material, category } = req.body;
    const c = Number(cost) || 0;
    if (!title) {
      if (!c) return res.status(400).json({ error: "cost is required" });
      return res.json(recommendPrice({ cost: c, craft }));
    }
    const market = await researchMarket({ title, description, craft, material, category });
    const result = recommendMarketPrice({ cost: c, craft, market });
    if (!result) return res.status(400).json({ error: "Enter your cost — market prices are unavailable right now" });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

