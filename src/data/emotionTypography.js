/**
 * Emotion → Typography pairings for SeeUI.
 * Each emotion maps to a Heading + Body Google Font pair with psychological rationale.
 */

/**
 * @typedef {{
 *   name: string,
 *   family: string,
 *   google: string,
 *   category: 'serif'|'sans'|'display'|'script',
 *   googleUrl: string
 * }} FontSpec
 *
 * @typedef {{
 *   id: string,
 *   label: string,
 *   psychology: string,
 *   heading: FontSpec,
 *   body: FontSpec
 * }} EmotionTypePair
 */

function fontSpec(name, category, weights = "400;500;600;700") {
  // Google CSS2 family token: spaces → +, keep weight axis
  const googleFamily = name.replace(/ /g, "+");
  const google = `${googleFamily}:wght@${weights}`;
  const fallback =
    category === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : category === "script"
        ? "cursive"
        : "system-ui, -apple-system, 'Segoe UI', sans-serif";
  return {
    name,
    // Quoted family name MUST match Google stylesheet exactly
    family: `"${name}", ${fallback}`,
    google,
    category,
    googleUrl: `https://fonts.google.com/specimen/${name.replace(/ /g, "+")}`,
    // Map to SeeUI FONTS slug when available (for main typography board sync)
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  };
}

/** @type {Record<string, EmotionTypePair>} */
export const EMOTION_TYPOGRAPHY = {
  trust: {
    id: "trust",
    label: "Trust / Corporate",
    psychology: "Serif authority signals reliability; open sans keeps body approachable.",
    heading: fontSpec("Merriweather", "serif", "400;700;900"),
    body: fontSpec("Open Sans", "sans", "400;500;600;700"),
  },
  safety: {
    id: "safety",
    label: "Safety / Stability",
    psychology: "Balanced serif + neutral Inter for calm, professional clarity.",
    heading: fontSpec("Source Serif 4", "serif", "400;600;700"),
    body: fontSpec("Inter", "sans", "400;500;600;700"),
  },
  calm: {
    id: "calm",
    label: "Calm / Soft",
    psychology: "Gentle rounded sans for low arousal and easy long-form reading.",
    heading: fontSpec("Nunito", "sans", "400;600;700;800"),
    body: fontSpec("Nunito Sans", "sans", "400;500;600;700"),
  },
  energy: {
    id: "energy",
    label: "Energy / Modern",
    psychology: "Geometric bold headings drive momentum; Roboto stays legible.",
    heading: fontSpec("Montserrat", "sans", "500;600;700;800;900"),
    body: fontSpec("Roboto", "sans", "400;500;700"),
  },
  love: {
    id: "love",
    label: "Love / Warmth",
    psychology: "Romantic display + soft body type for emotional connection.",
    heading: fontSpec("Playfair Display", "serif", "400;600;700;800"),
    body: fontSpec("Lato", "sans", "300;400;700"),
  },
  joy: {
    id: "joy",
    label: "Joy / Playful",
    psychology: "Rounded display fonts feel fun; Quicksand keeps UI friendly.",
    heading: fontSpec("Fredoka", "display", "400;500;600;700"),
    body: fontSpec("Quicksand", "sans", "400;500;600;700"),
  },
  optimism: {
    id: "optimism",
    label: "Optimism / Bright",
    psychology: "Open, airy sans pairings signal hope and approachability.",
    heading: fontSpec("Poppins", "sans", "500;600;700;800"),
    body: fontSpec("Work Sans", "sans", "400;500;600;700"),
  },
  growth: {
    id: "growth",
    label: "Growth / Nature",
    psychology: "Organic soft serifs with grounded humanist body type.",
    heading: fontSpec("Libre Baskerville", "serif", "400;700"),
    body: fontSpec("Source Sans 3", "sans", "400;500;600;700"),
  },
  harmony: {
    id: "harmony",
    label: "Harmony / Balance",
    psychology: "Even, classical proportions for visual equilibrium.",
    heading: fontSpec("Cormorant Garamond", "serif", "400;600;700"),
    body: fontSpec("Karla", "sans", "400;500;600;700"),
  },
  royalty: {
    id: "royalty",
    label: "Royalty / Prestige",
    psychology: "High-contrast serif luxury with refined sans body.",
    heading: fontSpec("Playfair Display", "serif", "400;600;700;800;900"),
    body: fontSpec("Lato", "sans", "300;400;700"),
  },
  creativity: {
    id: "creativity",
    label: "Creativity / Bold",
    psychology: "Expressive display headings with modern geometric body.",
    heading: fontSpec("Space Grotesk", "sans", "400;500;600;700"),
    body: fontSpec("DM Sans", "sans", "400;500;700"),
  },
  luxury: {
    id: "luxury",
    label: "Luxury / Premium",
    psychology: "Elegant Didone-inspired serif + quiet minimal body.",
    heading: fontSpec("Cormorant", "serif", "400;500;600;700"),
    body: fontSpec("Montserrat", "sans", "300;400;500;600"),
  },
  // Gallery aliases
  corporate: {
    id: "corporate",
    label: "Corporate",
    psychology: "Classic trust pairing for enterprise brands.",
    heading: fontSpec("Merriweather", "serif", "400;700;900"),
    body: fontSpec("Inter", "sans", "400;500;600;700"),
  },
  modern: {
    id: "modern",
    label: "Modern",
    psychology: "Tech-forward geometric stack.",
    heading: fontSpec("Montserrat", "sans", "600;700;800"),
    body: fontSpec("Roboto", "sans", "400;500;700"),
  },
};

export const DEFAULT_TYPOGRAPHY_PAIR = EMOTION_TYPOGRAPHY.trust;

/**
 * Resolve typography pair for an emotion id (with alias fallbacks).
 * @param {string|null|undefined} emotionId
 * @returns {EmotionTypePair}
 */
export function getTypographyForEmotion(emotionId) {
  if (!emotionId) return DEFAULT_TYPOGRAPHY_PAIR;
  const key = String(emotionId).toLowerCase().trim();
  if (EMOTION_TYPOGRAPHY[key]) return EMOTION_TYPOGRAPHY[key];

  // Soft aliases
  const aliases = {
    playful: "joy",
    happy: "joy",
    professional: "trust",
    corporate: "trust",
    premium: "luxury",
    elegant: "luxury",
    power: "energy",
    bold: "energy",
    nature: "growth",
    eco: "growth",
    peaceful: "calm",
    secure: "safety",
    creative: "creativity",
    artistic: "creativity",
    regal: "royalty",
    prestige: "royalty",
  };
  if (aliases[key] && EMOTION_TYPOGRAPHY[aliases[key]]) {
    return EMOTION_TYPOGRAPHY[aliases[key]];
  }
  return DEFAULT_TYPOGRAPHY_PAIR;
}

/**
 * Pick dominant emotion id from a list (first wins if no weights).
 * @param {string[]} emotionIds
 * @param {Record<string, number>} [weights]
 */
export function pickPrimaryEmotion(emotionIds = [], weights = {}) {
  if (!emotionIds?.length) return "trust";
  return [...emotionIds].sort(
    (a, b) => (weights[b] || 1) - (weights[a] || 1),
  )[0];
}

/**
 * Build a single Google Fonts CSS2 URL for one or more font specs.
 * @param {FontSpec[]} fonts
 */
export function buildDynamicGoogleFontsUrl(fonts) {
  const unique = [];
  const seen = new Set();
  for (const f of fonts) {
    if (!f?.google || seen.has(f.google)) continue;
    seen.add(f.google);
    // family=Name:wght@400;700 — keep ; unescaped (Google CSS2 expects them)
    unique.push(`family=${f.google}`);
  }
  if (!unique.length) return null;
  return `https://fonts.googleapis.com/css2?${unique.join("&")}&display=swap`;
}

/**
 * CSS @import snippet for a pair.
 * @param {EmotionTypePair} pair
 */
export function toGoogleFontsImport(pair) {
  const url = buildDynamicGoogleFontsUrl([pair.heading, pair.body]);
  if (!url) return "";
  return `@import url('${url}');`;
}

/**
 * Human-readable label for badges.
 * @param {EmotionTypePair} pair
 */
export function formatTypographyLabel(pair) {
  return `${pair.heading.name} (Heading) + ${pair.body.name} (Body)`;
}

export const EMOTION_TYPOGRAPHY_LIST = Object.values(EMOTION_TYPOGRAPHY);
