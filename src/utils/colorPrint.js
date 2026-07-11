/**
 * Print-oriented color utilities — HEX/RGB → estimated CMYK for brand books.
 * Note: CMYK is a simplified RGB conversion for design guides (not ICC-profile accurate).
 */

import { normalizeHex } from "./wcagContrast";

/**
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }|null}
 */
export function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

/**
 * Approximate sRGB → CMYK (0–100 integers).
 * Standard formula (no profile): K = 1 - max(R,G,B); C/M/Y from remaining.
 * @param {number} r 0–255
 * @param {number} g 0–255
 * @param {number} b 0–255
 * @returns {{ c: number, m: number, y: number, k: number }}
 */
export function rgbToCmyk(r, g, b) {
  const rr = Math.max(0, Math.min(255, r)) / 255;
  const gg = Math.max(0, Math.min(255, g)) / 255;
  const bb = Math.max(0, Math.min(255, b)) / 255;

  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Full print codes for a hex color.
 * @param {string} hex
 */
export function getPrintColorCodes(hex) {
  const n = normalizeHex(hex) || "#000000";
  const rgb = hexToRgb(n) || { r: 0, g: 0, b: 0 };
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  return {
    hex: n,
    rgb,
    rgbString: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    cmyk,
    cmykString: `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`,
  };
}
