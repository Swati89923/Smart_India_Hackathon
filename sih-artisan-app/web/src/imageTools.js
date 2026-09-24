// Client-side photo enhancement for the "AI Image Enhancement" step.
// Runs on the artisan's own photo: centre-crop to the 1:1 marketplace
// format, per-channel auto-levels (fixes dim / colour-cast workshop light)
// and a gentle saturation lift. The backend /ai/enhance call adds the
// Gemini quality check + tip when a key is configured.

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });

function drawCover(img, size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const s = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return { c, ctx };
}

function percentile(hist, total, p) {
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= total * p) return i;
  }
  return 255;
}

/** Returns { original, enhanced } JPEG data URLs (800×800). */
export async function enhancePhoto(src, size = 800) {
  const img = await loadImage(src);

  const { c: oc } = drawCover(img, size);
  const original = oc.toDataURL("image/jpeg", 0.85);

  const { c, ctx } = drawCover(img, size);
  const im = ctx.getImageData(0, 0, size, size);
  const d = im.data;
  const total = size * size;

  // Per-channel 1%–99% auto-levels
  const lut = [0, 1, 2].map((ch) => {
    const hist = new Array(256).fill(0);
    for (let i = ch; i < d.length; i += 4) hist[d[i]]++;
    const lo = percentile(hist, total, 0.01);
    const hi = Math.max(lo + 1, percentile(hist, total, 0.99));
    return Array.from({ length: 256 }, (_, v) => Math.max(0, Math.min(255, ((v - lo) * 255) / (hi - lo))));
  });

  const SAT = 1.15;
  for (let i = 0; i < d.length; i += 4) {
    let r = lut[0][d[i]];
    let g = lut[1][d[i + 1]];
    let b = lut[2][d[i + 2]];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * SAT;
    g = l + (g - l) * SAT;
    b = l + (b - l) * SAT;
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(im, 0, 0);

  return { original, enhanced: c.toDataURL("image/jpeg", 0.85) };
}

export const stripDataUrl = (u = "") => u.replace(/^data:image\/\w+;base64,/, "");

/** Downscale any image source to a JPEG data URL (longest side ≤ max) for uploading. */
export async function toUploadJpeg(src, max = 1600) {
  const img = await loadImage(src);
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}

/** Fit the whole image inside a square canvas (no cropping), padded with a studio backdrop. */
export async function padToSquare(src, size = 1000, bg = "#F7F4EF", margin = 0.06) {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const inner = size * (1 - margin * 2);
  const s = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return c.toDataURL("image/jpeg", 0.88);
}
