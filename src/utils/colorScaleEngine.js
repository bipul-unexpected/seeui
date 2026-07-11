/**
 * Full Design System Color Scale Engine
 * Generates production-ready Tailwind 50–950 scales from a base (500) HEX.
 *
 * Pure JS — no external color libraries.
 */

import { normalizeHex, getRelativeLuminance } from "./wcagContrast";

/** Tailwind shade keys in display order */
export const TAILWIND_SCALE_KEYS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

/**
 * Blend factors toward the light pole (L ≈ 98%).
 * Higher = closer to near-white. 500 is the base (no blend).
 */
const LIGHT_BLEND = {
  50: 0.94,
  100: 0.82,
  200: 0.64,
  300: 0.42,
  400: 0.2,
};

/**
 * Blend factors toward the dark pole (L ≈ 10%).
 * Higher = closer to near-black. 500 is the base (no blend).
 */
const DARK_BLEND = {
  600: 0.18,
  700: 0.36,
  800: 0.54,
  900: 0.72,
  950: 0.88,
};

const LIGHT_POLE = 97.5;
const DARK_POLE = 9.5;

// ─── Core conversions (self-contained) ───────────────────────────────────────

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
 * @param {number} r 0–255
 * @param {number} g 0–255
 * @param {number} b 0–255
 * @returns {{ h: number, s: number, l: number }} h 0–360, s/l 0–100
 */
export function rgbToHsl(r, g, b) {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) h = ((bb - rr) / d + 2) / 6;
  else h = ((rr - gg) / d + 4) / 6;

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * HSL → RGB (h 0–360, s/l 0–100).
 * @returns {{ r: number, g: number, b: number }} 0–255
 */
export function hslToRgb(h, s, l) {
  let hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
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
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} #RRGGBB
 */
export function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        clamp(Math.round(v), 0, 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

/**
 * @param {string} hex
 * @returns {{ h: number, s: number, l: number }|null}
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {string}
 */
export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Saturation curve:
 * - Lighter stops: pull S down to avoid neon “burn”
 * - Darker stops: hold / slightly boost S so shadows stay rich, not muddy
 * - Near black: ease S down slightly so 950 doesn’t look fluorescent
 *
 * @param {number} baseS 0–100
 * @param {number} t blend 0–1
 * @param {'light'|'dark'} pole
 */
function adjustSaturation(baseS, t, pole) {
  if (baseS < 2) return 0; // pure greys stay grey

  if (pole === "light") {
    // Drop saturation as we approach white (prevents pastel neon)
    const factor = 1 - t * 0.62;
    // Very pale stops also get a soft floor for brand tint
    const minS = lerp(baseS * 0.35, 8, 1 - t);
    return clamp(Math.max(baseS * factor, minS * (t > 0.7 ? 0.6 : 0.35)), 0, 100);
  }

  // dark pole
  const boost = 1 + t * 0.14;
  let s = baseS * boost;
  // At deepest stops, slightly ease saturation to avoid digital purple/black mud
  if (t > 0.65) {
    s *= lerp(1, 0.88, (t - 0.65) / 0.35);
  }
  return clamp(s, 0, 100);
}

/**
 * Generate a single shade from base HSL.
 * @param {{ h: number, s: number, l: number }} base
 * @param {number} stop Tailwind key
 */
function shadeFromBase(base, stop) {
  if (stop === 500) {
    return { h: base.h, s: base.s, l: base.l };
  }

  if (LIGHT_BLEND[stop] != null) {
    const t = LIGHT_BLEND[stop];
    // Bias lightness toward pole; if base is already very light, still climb
    const targetL = Math.max(base.l, LIGHT_POLE * 0.5);
    const l = lerp(base.l, Math.max(targetL, LIGHT_POLE), t);
    // Tiny hue shift toward cooler pastels optional — keep hue stable for brand fidelity
    const s = adjustSaturation(base.s, t, "light");
    return { h: base.h, s, l: clamp(l, 0, 99) };
  }

  if (DARK_BLEND[stop] != null) {
    const t = DARK_BLEND[stop];
    const l = lerp(base.l, Math.min(base.l, DARK_POLE), t);
    // Ensure we actually darken even if base is already dark
    const l2 = lerp(base.l, DARK_POLE, t);
    const s = adjustSaturation(base.s, t, "dark");
    return { h: base.h, s, l: clamp(l2, 2, 100) };
  }

  return { h: base.h, s: base.s, l: base.l };
}

/**
 * Generate a full Tailwind 50–950 color scale.
 * Input HEX is treated as the **500** base shade.
 *
 * @param {string} hexColor e.g. "#6366F1"
 * @returns {Record<string, string>} keys "50"…"950" → "#RRGGBB"
 */
export function generateColorScale(hexColor) {
  const normalized = normalizeHex(hexColor) || "#6366F1";
  const base = hexToHsl(normalized) || { h: 239, s: 84, l: 67 };

  /** @type {Record<string, string>} */
  const scale = {};

  for (const stop of TAILWIND_SCALE_KEYS) {
    const hsl = shadeFromBase(base, stop);
    // 500 must round-trip to the exact input when possible
    if (stop === 500) {
      scale[String(stop)] = normalized;
    } else {
      scale[String(stop)] = hslToHex(hsl.h, hsl.s, hsl.l);
    }
  }

  return scale;
}

/**
 * Enriched scale for UI: hex + hsl + luminance + auto ink color.
 * @param {string} hexColor
 */
export function generateColorScaleMeta(hexColor) {
  const scale = generateColorScale(hexColor);
  const base = hexToHsl(normalizeHex(hexColor) || "#6366F1");

  return TAILWIND_SCALE_KEYS.map((stop) => {
    const hex = scale[String(stop)];
    const hsl = hexToHsl(hex);
    const lum = getRelativeLuminance(hex);
    // Dark grey (not pure black) for light cells — Tailwind docs style
    const ink = lum > 0.45 ? "#1E293B" : "#FFFFFF";
    return {
      stop,
      key: String(stop),
      hex,
      hsl,
      luminance: lum,
      ink,
      isBase: stop === 500,
    };
  });
}

/**
 * Format scale as a tailwind.config.js theme.extend.colors snippet.
 *
 * @param {Record<string, string>|string} scaleOrHex full scale object OR base hex
 * @param {object} [opts]
 * @param {string} [opts.colorName='brand']
 * @param {boolean} [opts.moduleExports=true] wrap in module.exports theme block
 * @param {string} [opts.comment]
 */
export function formatTailwindScaleConfig(scaleOrHex, opts = {}) {
  const {
    colorName = "brand",
    moduleExports = true,
    comment = "SeeUI emotion design system — paste into tailwind.config.js",
  } = opts;

  const scale =
    typeof scaleOrHex === "string"
      ? generateColorScale(scaleOrHex)
      : scaleOrHex || {};

  const lines = TAILWIND_SCALE_KEYS.map((stop) => {
    const hex = (scale[String(stop)] || "#000000").toLowerCase();
    return `        ${stop}: '${hex}',`;
  }).join("\n");

  if (!moduleExports) {
    return `${colorName}: {\n${lines}\n      }`;
  }

  return `// ${comment}
module.exports = {
  theme: {
    extend: {
      colors: {
        ${colorName}: {
${lines}
        },
      },
    },
  },
};
`;
}

/**
 * CSS custom properties for the scale.
 * @param {Record<string, string>|string} scaleOrHex
 * @param {string} [prefix='brand']
 */
export function formatCssScaleVariables(scaleOrHex, prefix = "brand") {
  const scale =
    typeof scaleOrHex === "string"
      ? generateColorScale(scaleOrHex)
      : scaleOrHex || {};

  const body = TAILWIND_SCALE_KEYS.map((stop) => {
    const hex = scale[String(stop)] || "#000000";
    return `  --color-${prefix}-${stop}: ${hex};`;
  }).join("\n");

  return `:root {\n${body}\n}`;
}

/**
 * Safe color name slug from emotion / label.
 * @param {string} [name]
 */
export function scaleColorName(name) {
  const raw = String(name || "brand")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || "brand";
}

/**
 * Pick the best base hex for a scale from a palette object.
 * Prefer accent/highlight (primary emotion color), fall back to text.
 * @param {object} palette
 */
export function pickScaleBase(palette = {}) {
  return (
    normalizeHex(palette.accent) ||
    normalizeHex(palette.highlight) ||
    normalizeHex(palette.primary) ||
    normalizeHex(palette.text) ||
    "#6366F1"
  );
}
