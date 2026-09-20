const express = require("express");
const {
  transcribeVoiceNote,
  translateText,
  generateCatalogue,
  enhanceImage,
} = require("../services/nlpCatalogue");
const { recommendPrice } = require("../services/pricingModel");
const { isGeminiConfigured } = require("../services/geminiService");

const router = express.Router();

// Check AI Service status
router.get("/status", (req, res) => {
  res.json({
    geminiConfigured: isGeminiConfigured(),
    model: isGeminiConfigured() ? "gemini-3.6-flash" : "local-template-fallback",
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
    const { craft, imageBase64 } = req.body;
    const result = await enhanceImage({ craft, imageBase64 });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Step 3 — Describe by Voice (Speech-to-Text: regional-language voice input)
router.post("/transcribe", (req, res) => {
  const { craft } = req.body;
  res.json(transcribeVoiceNote({ craft }));
});

// Optional helper used by the "show English translation" toggle
router.post("/translate", (req, res) => {
  const { text, craft } = req.body;
  res.json(translateText({ text, craft }));
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

// Step 5 — Recommend Price (Pricing Model: cost + market-trend data -> price range)
router.post("/price", (req, res) => {
  const { cost, craft } = req.body;
  if (!cost) return res.status(400).json({ error: "cost is required" });
  res.json(recommendPrice({ cost: Number(cost), craft }));
});

module.exports = router;

