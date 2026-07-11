/**
 * One-click export formatters for psychology palettes + emotion typography.
 */

import {
  getTypographyForEmotion,
  toGoogleFontsImport,
} from "../data/emotionTypography";
import {
  generateColorScale,
  formatTailwindScaleConfig,
  pickScaleBase,
  scaleColorName,
} from "./colorScaleEngine";

function pickColors(palette = {}) {
  const background =
    palette.background || palette.BackgroundColor || "#0F172A";
  const text = palette.text || palette.TextColor || "#F8FAFC";
  const highlight =
    palette.accent ||
    palette.highlight ||
    palette.HighlightColor ||
    "#6366F1";
  return { background, text, highlight };
}

function pickTypography(palette = {}) {
  if (palette.typography) return palette.typography;
  return getTypographyForEmotion(palette.emotion || palette.emotionId);
}

/** Tailwind theme.extend — colors + fontFamily */
export function toTailwindConfig(palette) {
  const { background, text, highlight } = pickColors(palette);
  const pair = pickTypography(palette);
  const headingName = pair.heading.name;
  const bodyName = pair.body.name;

  return `// SeeUI psychology palette + typography — paste into tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "${background}",
          text: "${text}",
          highlight: "${highlight}",
        },
      },
      fontFamily: {
        heading: ["${headingName}", "${pair.heading.category === "serif" ? "Georgia" : "system-ui"}", "${pair.heading.category === "serif" ? "serif" : "sans-serif"}"],
        body: ["${bodyName}", "system-ui", "sans-serif"],
      },
    },
  },
};`;
}

/** CSS custom properties + Google Fonts @import */
export function toCssVariables(palette) {
  const { background, text, highlight } = pickColors(palette);
  const pair = pickTypography(palette);
  const importLine = toGoogleFontsImport(pair);

  return `${importLine}

:root {
  --color-bg: ${background};
  --color-text: ${text};
  --color-primary: ${highlight};
  --color-highlight: ${highlight};
  --font-heading: ${pair.heading.family};
  --font-body: ${pair.body.family};
}

/* Usage */
/* h1, h2, h3 { font-family: var(--font-heading); } */
/* body, p, button { font-family: var(--font-body); } */`;
}

/** Simple hex array string */
export function toHexArray(palette) {
  const { background, text, highlight } = pickColors(palette);
  return `["${background}", "${text}", "${highlight}"]`;
}

/** Typography-only export (import + CSS vars) */
export function toTypographyExport(palette) {
  const pair = pickTypography(palette);
  const importLine = toGoogleFontsImport(pair);
  return `${importLine}

/* Emotion: ${pair.label} */
:root {
  --font-heading: ${pair.heading.family};
  --font-body: ${pair.body.family};
}

.heading { font-family: var(--font-heading); }
.body { font-family: var(--font-body); }`;
}

/** Full 50–950 brand scale from primary accent */
export function toTailwindScaleExport(palette) {
  const base = pickScaleBase(palette);
  const name = scaleColorName(palette.emotion || palette.emotionId || "brand");
  return formatTailwindScaleConfig(generateColorScale(base), {
    colorName: name,
    comment: `SeeUI full design system scale · base 500 = ${base}`,
  });
}

export const EXPORT_OPTIONS = [
  {
    id: "tailwind",
    label: "Tailwind Config",
    description: "colors + fontFamily.heading/body",
    format: toTailwindConfig,
  },
  {
    id: "scale",
    label: "Full Scale 50–950",
    description: "theme.extend.colors.brand 50→950",
    format: toTailwindScaleExport,
  },
  {
    id: "css",
    label: "CSS + Fonts",
    description: "@import + :root color & font vars",
    format: toCssVariables,
  },
  {
    id: "hex",
    label: "Hex Array",
    description: '["#HEX1", "#HEX2", "#HEX3"]',
    format: toHexArray,
  },
  {
    id: "type",
    label: "Typography CSS",
    description: "Google Fonts import + font variables",
    format: toTypographyExport,
  },
];

/**
 * Copy text via Clipboard API with fallback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
