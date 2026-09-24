/**
 * imageService.js — real product-photo enhancement.
 *
 *   original photo ──► remove.bg (background removed, clean studio backdrop)
 *                 └──► Cloudinary (stored + square pad + auto-improve + CDN URL)
 *
 * Each step is optional: without REMOVE_BG_API_KEY the background is kept,
 * without Cloudinary the image is returned as a data URL.
 */
const cloudinary = require("cloudinary").v2;

const env = (k) => (process.env[k] || "").trim();
const isRemoveBgConfigured = () => env("REMOVE_BG_API_KEY").length > 0;
const isCloudinaryConfigured = () => !!(env("CLOUDINARY_CLOUD_NAME") && env("CLOUDINARY_API_KEY") && env("CLOUDINARY_API_SECRET"));

let cloudinaryReady = false;
function setupCloudinary() {
  if (!cloudinaryReady && isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: env("CLOUDINARY_CLOUD_NAME"),
      api_key: env("CLOUDINARY_API_KEY"),
      api_secret: env("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    cloudinaryReady = true;
  }
  return cloudinaryReady;
}

const cleanBase64 = (b64 = "") => b64.replace(/^data:[\w/+.-]+;base64,/, "");
const BACKDROP = "F7F4EF"; // warm off-white studio background

/** remove.bg → JPEG buffer with the product on a clean backdrop (or null). */
async function removeBackground(imageBase64) {
  if (!isRemoveBgConfigured()) return null;
  const form = new FormData();
  form.append("image_file_b64", cleanBase64(imageBase64));
  form.append("size", env("REMOVE_BG_SIZE") || "auto");
  form.append("format", "jpg");
  form.append("bg_color", BACKDROP);
  form.append("crop", "true");
  form.append("crop_margin", "8%");
  try {
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": env("REMOVE_BG_API_KEY") },
      body: form,
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("[remove.bg]", res.status, body.slice(0, 200));
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.warn("[remove.bg] request failed:", err.message);
    return null;
  }
}

/** Upload a data URL / base64 to Cloudinary, returning the stored asset (or null). */
async function uploadToCloudinary(dataUrl, folder) {
  if (!setupCloudinary()) return null;
  try {
    return await cloudinary.uploader.upload(dataUrl, { folder: `shilpsaathi/${folder}`, resource_type: "image" });
  } catch (err) {
    console.warn("[Cloudinary] upload failed:", err.message || err);
    return null;
  }
}

// Square 1000×1000 marketplace format, padded with the backdrop, auto-improved & compressed.
const marketplaceUrl = (publicId, { improve = true } = {}) =>
  cloudinary.url(publicId, {
    secure: true,
    transformation: [
      ...(improve ? [{ effect: "improve" }] : []),
      { width: 1000, height: 1000, crop: "pad", background: `rgb:${BACKDROP}` },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

/**
 * Full pipeline. Returns { originalUrl, enhancedImageUrl, tags, backgroundRemoved, stored }.
 */
async function enhanceProductPhoto(imageBase64) {
  const originalDataUrl = `data:image/jpeg;base64,${cleanBase64(imageBase64)}`;
  const tags = [];

  const [cutout, originalAsset] = await Promise.all([
    removeBackground(imageBase64),
    uploadToCloudinary(originalDataUrl, "originals"),
  ]);

  let enhancedDataUrl = null;
  if (cutout) {
    enhancedDataUrl = `data:image/jpeg;base64,${cutout.toString("base64")}`;
    tags.push("background_removed", "cropped_to_product");
  }

  let enhancedImageUrl = null;
  if (enhancedDataUrl) {
    const asset = await uploadToCloudinary(enhancedDataUrl, "enhanced");
    enhancedImageUrl = asset ? marketplaceUrl(asset.public_id) : enhancedDataUrl;
  } else if (originalAsset) {
    enhancedImageUrl = marketplaceUrl(originalAsset.public_id);
  }
  if (enhancedImageUrl && enhancedImageUrl.startsWith("http")) tags.push("lighting_fixed", "square_marketplace_format");

  return {
    originalUrl: originalAsset ? originalAsset.secure_url : null,
    enhancedImageUrl,
    tags,
    backgroundRemoved: !!cutout,
    stored: enhancedImageUrl ? enhancedImageUrl.startsWith("http") : false,
  };
}

module.exports = { enhanceProductPhoto, isRemoveBgConfigured, isCloudinaryConfigured, uploadToCloudinary };
