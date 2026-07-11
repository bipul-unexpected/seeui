/**
 * Native color math utilities — no external color libraries.
 * RGB ↔ HEX ↔ HSL + performance-optimized dominant color extraction.
 */

// ─── Conversions ──────────────────────────────────────────────────────────────

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        clamp(Math.round(x), 0, 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return { r: 0, g: 0, b: 0 };
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * @param {number} r 0–255
 * @param {number} g 0–255
 * @param {number} b 0–255
 * @returns {{ h: number, s: number, l: number }} h 0–360, s/l 0–100
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function formatHsl({ h, s, l }) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ─── Dominant color extraction (canvas, downscaled) ───────────────────────────

const MAX_CANVAS = 150; // CRITICAL: keep pixel walk cheap
const BUCKET = 24; // quantize to reduce noise (0–255 step)

/**
 * Load an image source (data URL or blob URL) into an HTMLImageElement.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image for analysis."));
    img.src = src;
  });
}

/**
 * Draw image onto a downscaled canvas and return ImageData.
 * @param {HTMLImageElement} img
 * @param {number} [maxSize=150]
 */
export function getDownscaledImageData(img, maxSize = MAX_CANVAS) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  if (!nw || !nh) throw new Error("Invalid image dimensions.");

  const scale = Math.min(maxSize / nw, maxSize / nh, 1);
  const w = Math.max(1, Math.round(nw * scale));
  const h = Math.max(1, Math.round(nh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/**
 * Quantized bucket dominant-color extractor.
 * Skips near-transparent, near-black, and near-white pixels that flood palettes.
 *
 * @param {ImageData} imageData
 * @param {number} [count=5]
 * @returns {Array<{
 *   hex: string,
 *   rgb: { r: number, g: number, b: number },
 *   hsl: { h: number, s: number, l: number },
 *   hslString: string,
 *   weight: number,
 *   role: 'background'|'accent'|'support'
 * }>}
 */
export function extractDominantColors(imageData, count = 5) {
  const data = imageData.data;
  const buckets = new Map();

  // Sample every pixel on the *already downscaled* canvas (cheap)
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 140) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Skip pure extremes that wash out emotion
    if (max < 14 || min > 246) continue;

    const qr = Math.round(r / BUCKET) * BUCKET;
    const qg = Math.round(g / BUCKET) * BUCKET;
    const qb = Math.round(b / BUCKET) * BUCKET;
    const key = (qr << 16) | (qg << 8) | qb;

    const entry = buckets.get(key);
    if (entry) {
      entry.r += r;
      entry.g += g;
      entry.b += b;
      entry.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }

  if (buckets.size === 0) {
    // Fallback: mid-grey if image was all white/black
    const hsl = { h: 220, s: 8, l: 45 };
    return [
      {
        hex: "#6B7280",
        rgb: { r: 107, g: 114, b: 128 },
        hsl,
        hslString: formatHsl(hsl),
        weight: 1,
        role: "background",
      },
    ];
  }

  const sorted = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, Math.max(3, count));

  const total = sorted.reduce((s, c) => s + c.n, 0) || 1;

  const colors = sorted.map((c, index) => {
    const r = Math.round(c.r / c.n);
    const g = Math.round(c.g / c.n);
    const b = Math.round(c.b / c.n);
    const hsl = rgbToHsl(r, g, b);
    return {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl,
      hslString: formatHsl(hsl),
      weight: c.n / total,
      role: index === 0 ? "background" : index === 1 ? "accent" : "support",
    };
  });

  // Ensure at least 3 slots when possible by slight HSL variants
  while (colors.length < 3 && colors.length > 0) {
    const base = colors[colors.length - 1];
    const shift = colors.length * 12;
    const h = (base.hsl.h + shift) % 360;
    const l = clamp(base.hsl.l + (colors.length % 2 === 0 ? 8 : -8), 12, 88);
    // Approximate reverse: keep s, use original rgb mix as soft variant
    const variant = {
      ...base,
      hex: base.hex,
      hsl: { h, s: base.hsl.s, l },
      hslString: formatHsl({ h, s: base.hsl.s, l }),
      weight: base.weight * 0.15,
      role: "support",
    };
    colors.push(variant);
  }

  return colors.slice(0, count);
}

/**
 * Full pipeline: src → downscale → palette.
 * @param {string} imageSrc
 * @param {{ maxColors?: number, maxSize?: number }} [opts]
 */
export async function extractPaletteFromImage(imageSrc, opts = {}) {
  const { maxColors = 5, maxSize = MAX_CANVAS } = opts;
  const img = await loadImage(imageSrc);
  const imageData = getDownscaledImageData(img, maxSize);
  return extractDominantColors(imageData, maxColors);
}
