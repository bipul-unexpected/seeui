/**
 * Shift a psychology palette to dark or light preview mode
 * while preserving hue (emotional core).
 */

import { normalizeHex } from "./wcagContrast";
import { getContrastColor } from "./getContrastColor";

function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

/**
 * Detect whether a background reads as dark.
 * @param {string} bgHex
 */
export function isDarkBackground(bgHex) {
  return getContrastColor(bgHex) === "#FFFFFF";
}

/**
 * Shift a single hex toward dark or light mode, keeping hue + saturation core.
 * @param {string} hex
 * @param {'dark'|'light'} mode
 * @param {'bg'|'accent'} role
 */
export function shiftHexForMode(hex, mode, role = "bg") {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);

  if (role === "accent") {
    // Keep accent vivid; slight L clamp
    const l =
      mode === "dark"
        ? Math.min(68, Math.max(48, hsl.l))
        : Math.min(58, Math.max(40, hsl.l));
    const rgb = hslToRgb(hsl.h, Math.max(hsl.s, 55), l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Background: preserve H/S, force L into mode band
  const l =
    mode === "dark"
      ? Math.min(18, Math.max(8, hsl.l > 50 ? 100 - hsl.l : hsl.l))
      : Math.min(98, Math.max(92, hsl.l < 50 ? 100 - hsl.l : hsl.l));
  const s = Math.min(hsl.s, mode === "dark" ? 55 : 40);
  const rgb = hslToRgb(hsl.h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Produce a preview palette for dark or light mode.
 * Does NOT mutate the source palette (dashboard colors stay intact unless applied).
 *
 * @param {{ background: string, text: string, accent?: string, highlight?: string }} source
 * @param {'dark'|'light'} mode
 */
export function adaptPaletteToMode(source, mode) {
  const bgSrc = source.background || source.BackgroundColor || "#0F172A";
  const hiSrc =
    source.accent ||
    source.highlight ||
    source.HighlightColor ||
    "#6366F1";

  const background = shiftHexForMode(bgSrc, mode, "bg");
  // Text always chosen for readability on the shifted bg
  const text = getContrastColor(background);
  const accent = shiftHexForMode(hiSrc, mode, "accent");

  return {
    background,
    text,
    accent,
    highlight: accent,
    mode,
    BackgroundColor: background,
    TextColor: text,
    HighlightColor: accent,
  };
}
