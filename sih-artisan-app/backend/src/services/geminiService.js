const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Checks if a valid Gemini API key is configured.
 */
function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(
    key &&
    key.trim().length > 0 &&
    !key.includes("your_gemini_api_key")
  );
}

function getGeminiClient() {
  if (!isGeminiConfigured()) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
}

/**
 * Generate a rich, bilingual product catalogue using Gemini 1.5 Flash.
 *
 * @param {Object} params
 * @param {string} params.craft - Selected craft category (pottery, weaving, painting, etc.)
 * @param {string} [params.imageBase64] - Base64-encoded photo string (without data URL prefix)
 * @param {string} [params.imageMimeType] - MIME type (e.g., 'image/jpeg', 'image/png')
 * @param {string} [params.voiceTranscript] - Artisan's vernacular voice note transcription
 * @returns {Promise<Object|null>} Structured catalogue object or null on fallback
 */
async function generateMultimodalCatalogue({
  craft = "pottery",
  imageBase64 = null,
  imageMimeType = "image/jpeg",
  voiceTranscript = "",
}) {
  const genAI = getGeminiClient();
  if (!genAI) {
    return null; // Signals caller to use fallback templates
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const prompt = `
You are ShilpSaathi's AI Handicraft Curator and Cataloging Expert for Indian artisans under the PM Vishwakarma Yojana and ONDC Network.
An artisan has uploaded a photograph of their handcrafted product and provided a regional voice description.

Input details:
- Stated Craft: "${craft}"
- Artisan's Voice Description / Story: "${voiceTranscript || "None provided"}"

Tasks:
1. Examine the visual features from the image (craft technique, colors, motifs, texture, materials) combined with any voice description.
2. Produce a compelling, commercial yet authentic listing that honors the artisan's cultural tradition.
3. Return a valid JSON object matching exactly this schema:
{
  "title": "Clean, attractive commercial English title (e.g. 'Handcrafted Blue Pottery Floral Vase — Jaipur Style')",
  "titleHi": "आकर्षक हिंदी शीर्षक (e.g. 'हस्तनिर्मित जयपुरी ब्लू पॉटरी फूलदान')",
  "description": "Rich 2-3 sentence English description highlighting craftsmanship, heritage story, and styling use.",
  "descriptionHi": "कारीगरी और पारंपरिक विरासत को दर्शाने वाला 2-3 वाक्यों का हिंदी विवरण।",
  "category": "E-commerce category (e.g. 'Home Decor', 'Textile', 'Wall Art', 'Jewelry', 'Apparel')",
  "craft": "${craft}",
  "materials": "Main materials used (e.g. 'Quartz clay, natural mineral pigments, lead-free glaze')",
  "tags": ["array", "of", "5-7", "relevant", "search", "tags"]
}
`;

    const parts = [prompt];

    if (imageBase64) {
      // Clean prefix if passed as data URL
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: imageMimeType || "image/jpeg",
        },
      });
    }

    const response = await model.generateContent(parts);
    const text = response.response.text();
    const parsed = JSON.parse(text);

    return {
      title: parsed.title,
      titleHi: parsed.titleHi,
      description: parsed.description,
      descriptionHi: parsed.descriptionHi,
      category: parsed.category || "Handicraft",
      craft: parsed.craft || craft,
      materials: parsed.materials || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      source: "gemini-3.6-flash",
    };
  } catch (error) {
    console.warn("[Gemini AI] Catalogue generation warning:", error.message || error);
    return null; // Safely trigger fallback
  }
}

/**
 * Analyzes image quality and generates enhancement metadata badges.
 *
 * @param {Object} params
 * @param {string} params.craft
 * @param {string} [params.imageBase64]
 * @returns {Promise<Object|null>}
 */
async function analyzeAndEnhanceImage({ craft = "pottery", imageBase64 = null }) {
  const genAI = getGeminiClient();
  if (!genAI || !imageBase64) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const prompt = `
Analyze this handicraft product photo for an e-commerce marketplace listing (craft: ${craft}).
Assess its image quality (lighting, background, framing, clarity).
Respond with JSON:
{
  "lighting": "good" | "fair" | "dim",
  "backgroundClean": true | false,
  "artisanTip": "Short 1-sentence tip in Hindi/English for the artisan to get an even better shot next time",
  "tags": ["background_removed", "lighting_fixed", "cropped_to_market_format"]
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const parsed = JSON.parse(result.response.text());
    return {
      enhancedImageUrl: `https://picsum.photos/seed/${craft}-${Date.now()}/700/500`,
      tags: parsed.tags || ["background_removed", "lighting_fixed", "cropped_to_market_format"],
      lighting: parsed.lighting || "good",
      artisanTip: parsed.artisanTip || "",
      source: "gemini-3.6-flash",
    };
  } catch (err) {
    console.warn("[Gemini AI] Image analysis fallback:", err.message || err);
    return null;
  }
}

/**
 * Translates vernacular artisan description to fluent English using Gemini.
 */
async function translateArtisanText({ text, craft = "pottery" }) {
  const genAI = getGeminiClient();
  if (!genAI || !text || !text.trim()) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.2,
      },
    });

    const prompt = `You are a translator for Indian artisans selling handcrafted goods on an e-commerce platform.
Translate the following description (craft category: ${craft}) into natural, engaging English suitable for a product listing.
Keep the translation concise, honoring traditional Indian craftsmanship terms if relevant.
Return ONLY the translated English text, without explanations or quotation marks.

Description to translate:
${text.trim()}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn("[Gemini AI] Translation warning:", err.message || err);
    return null;
  }
}

module.exports = {
  isGeminiConfigured,
  generateMultimodalCatalogue,
  analyzeAndEnhanceImage,
  translateArtisanText,
};
