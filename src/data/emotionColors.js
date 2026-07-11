/**
 * Emotion → Color Psychology data for SeeUI.
 * Produces website-ready Background / Text / Accent palettes with solid contrast.
 */

// ─── Psychological base hues (UI-ready, high contrast) ────────────────────────
export const COLOR_FAMILIES = {
  red: {
    name: "Red",
    psychology: "Passion, urgency, love, energy",
    bg: { dark: "#2B0F14", light: "#FFF1F2" },
    text: { dark: "#FFF1F2", light: "#881337" },
    accent: { dark: "#F43F5E", light: "#E11D48" },
  },
  yellow: {
    name: "Yellow",
    psychology: "Joy, optimism, attention, warmth",
    bg: { dark: "#1C1608", light: "#FFFBEB" },
    text: { dark: "#FFFBEB", light: "#78350F" },
    accent: { dark: "#F59E0B", light: "#D97706" },
  },
  blue: {
    name: "Blue",
    psychology: "Trust, calm, safety, professionalism",
    bg: { dark: "#0B1B33", light: "#EFF6FF" },
    text: { dark: "#F0F9FF", light: "#1E3A8A" },
    accent: { dark: "#3B82F6", light: "#2563EB" },
  },
  green: {
    name: "Green",
    psychology: "Growth, harmony, nature, balance",
    bg: { dark: "#0A1F16", light: "#ECFDF5" },
    text: { dark: "#ECFDF5", light: "#14532D" },
    accent: { dark: "#10B981", light: "#059669" },
  },
  purple: {
    name: "Purple",
    psychology: "Royalty, creativity, luxury, wisdom",
    bg: { dark: "#1A0B2E", light: "#FAF5FF" },
    text: { dark: "#FAF5FF", light: "#5B21B6" },
    accent: { dark: "#A855F7", light: "#7C3AED" },
  },
};

// ─── Emotions ─────────────────────────────────────────────────────────────────
export const EMOTIONS = [
  {
    id: "love",
    label: "Love",
    emoji: "♥",
    family: "red",
    weight: 1.2,
    avoid: [
      "Harsh neon reds (#FF0000) feel aggressive, not romantic",
      "Cold steel greys drain emotional warmth",
      "Pure black backgrounds can feel funereal instead of intimate",
    ],
  },
  {
    id: "energy",
    label: "Energy",
    emoji: "⚡",
    family: "red",
    weight: 1.1,
    avoid: [
      "Muted pastels kill momentum and urgency",
      "Overly dark navy can feel sluggish",
      "Brown-heavy palettes read as earthy, not energetic",
    ],
  },
  {
    id: "joy",
    label: "Joy",
    emoji: "☀",
    family: "yellow",
    weight: 1.2,
    avoid: [
      "Neon yellow (#FFFF00) fails WCAG on white and feels cheap",
      "Heavy black text on bright yellow causes eye strain",
      "Cool greys next to yellow mute happiness",
    ],
  },
  {
    id: "optimism",
    label: "Optimism",
    emoji: "✦",
    family: "yellow",
    weight: 1.0,
    avoid: [
      "Desaturated beige looks tired rather than hopeful",
      "Harsh orange-red accents introduce anxiety",
      "Overly dark backgrounds undermine lightness",
    ],
  },
  {
    id: "trust",
    label: "Trust",
    emoji: "◆",
    family: "blue",
    weight: 1.3,
    avoid: [
      "Neon or electric blues feel tech-gimmicky, not trustworthy",
      "Red accents signal danger and undermine reliability",
      "Hot pink or magenta clash with professional calm",
    ],
  },
  {
    id: "safety",
    label: "Safety",
    emoji: "◎",
    family: "blue",
    weight: 1.2,
    avoid: [
      "Aggressive reds trigger fight-or-flight responses",
      "High-contrast neons create visual tension",
      "Unstable multi-hue gradients feel unpredictable",
    ],
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "○",
    family: "blue",
    weight: 1.1,
    avoid: [
      "Saturated reds and oranges raise arousal",
      "Neon lime and hot pink create restlessness",
      "Harsh pure black-on-white can feel clinical, not calm",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    emoji: "✿",
    family: "green",
    weight: 1.15,
    avoid: [
      "Toxic neon green (#39FF14) feels artificial",
      "Heavy browns drag the palette into decay, not growth",
      "Harsh red accents fight natural harmony",
    ],
  },
  {
    id: "harmony",
    label: "Harmony",
    emoji: "◎",
    family: "green",
    weight: 1.05,
    avoid: [
      "Clashing complementary extremes (hot red + neon green)",
      "Over-saturated primaries create visual noise",
      "Metallic gold can feel competitive rather than balanced",
    ],
  },
  {
    id: "royalty",
    label: "Royalty",
    emoji: "♛",
    family: "purple",
    weight: 1.25,
    avoid: [
      "Cheap-looking neon purple (#BF00FF) undercuts luxury",
      "Bright yellow can feel carnival, not regal",
      "Muddy browns cheapen the palette",
    ],
  },
  {
    id: "creativity",
    label: "Creativity",
    emoji: "✧",
    family: "purple",
    weight: 1.15,
    avoid: [
      "Corporate navy-only schemes feel rigid",
      "Pure greyscale kills imaginative energy",
      "Harsh primary reds can dominate creative accents",
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    emoji: "◆",
    family: "purple",
    weight: 1.2,
    avoid: [
      "Bright neon accents scream discount, not premium",
      "Saturated candy pinks feel mass-market",
      "Overly light pastels can read as juvenile",
    ],
  },
];

const DEFAULT_PALETTE = {
  background: "#0F172A",
  text: "#F8FAFC",
  accent: "#6366F1",
  families: ["blue", "purple"],
  mode: "dark",
  labels: {
    background: "Slate",
    text: "Near White",
    accent: "Indigo",
  },
};

/**
 * @param {string[]} selectedIds
 * @returns {{ family: string, score: number }[]}
 */
export function scoreFamilies(selectedIds) {
  const scores = {};
  for (const id of selectedIds) {
    const emotion = EMOTIONS.find((e) => e.id === id);
    if (!emotion) continue;
    scores[emotion.family] = (scores[emotion.family] || 0) + emotion.weight;
  }
  return Object.entries(scores)
    .map(([family, score]) => ({ family, score }))
    .sort((a, b) => b.score - a.score);
}

function resolveMode(primaryFamily, preference = "dark") {
  if (preference === "light" || preference === "dark") return preference;
  return primaryFamily === "yellow" ? "light" : "dark";
}

/**
 * Generate a cohesive 3-color palette from selected emotions.
 * Colors are tuned for real website backgrounds + readable text.
 *
 * @param {string[]} selectedIds
 * @param {'dark'|'light'|'auto'} [modePreference='dark']
 */
export function generatePalette(selectedIds, modePreference = "dark") {
  if (!selectedIds || selectedIds.length === 0) {
    return { ...DEFAULT_PALETTE, emotion: "trust" };
  }

  // Highest-weight emotion drives typography pairing
  const primaryEmotionId = [...selectedIds].sort((a, b) => {
    const wa = EMOTIONS.find((e) => e.id === a)?.weight || 1;
    const wb = EMOTIONS.find((e) => e.id === b)?.weight || 1;
    return wb - wa;
  })[0];

  const ranked = scoreFamilies(selectedIds);
  const primary = ranked[0]?.family || "blue";
  const secondary = ranked[1]?.family || primary;
  const tertiary = ranked[2]?.family || secondary;
  const mode = resolveMode(primary, modePreference);

  const primaryFam = COLOR_FAMILIES[primary];
  const secondaryFam = COLOR_FAMILIES[secondary];
  const tertiaryFam = COLOR_FAMILIES[tertiary];

  if (ranked.length === 1) {
    return {
      background: primaryFam.bg[mode],
      text: primaryFam.text[mode],
      accent: primaryFam.accent[mode],
      families: [primary],
      mode,
      emotion: primaryEmotionId,
      label: EMOTIONS.find((e) => e.id === primaryEmotionId)?.label,
      labels: {
        background: `${primaryFam.name} ${mode === "dark" ? "Deep" : "Soft"}`,
        text: `${primaryFam.name} Ink`,
        accent: primaryFam.name,
      },
    };
  }

  const accentFamily =
    secondary !== primary
      ? secondaryFam
      : tertiary !== primary
        ? tertiaryFam
        : secondaryFam;

  return {
    background: primaryFam.bg[mode],
    text: primaryFam.text[mode],
    accent: accentFamily.accent[mode],
    families: ranked.map((r) => r.family),
    mode,
    emotion: primaryEmotionId,
    label: EMOTIONS.find((e) => e.id === primaryEmotionId)?.label,
    labels: {
      background: `${primaryFam.name} ${mode === "dark" ? "Deep" : "Soft"}`,
      text: `${primaryFam.name} Ink`,
      accent: accentFamily.name,
    },
  };
}

/**
 * @param {string[]} selectedIds
 * @param {number} [max=5]
 */
export function getAvoidWarnings(selectedIds, max = 5) {
  if (!selectedIds?.length) {
    return [
      "Select emotions above to see colors you should avoid",
      "Neon extremes and harsh primaries often break brand trust",
    ];
  }

  const tips = [];
  const seen = new Set();
  for (const id of selectedIds) {
    const emotion = EMOTIONS.find((e) => e.id === id);
    if (!emotion) continue;
    for (const tip of emotion.avoid) {
      const key = tip.slice(0, 24).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tips.push(tip);
      if (tips.length >= max) return tips;
    }
  }
  return tips;
}

/**
 * @param {{ background: string, text: string, accent: string }} palette
 */
export function toTailwindConfig(palette) {
  return `// Emotion palette — paste into tailwind.config.js theme.extend.colors
colors: {
  emotion: {
    background: "${palette.background}",
    text: "${palette.text}",
    accent: "${palette.accent}",
  },
}`;
}

/**
 * @param {{ background: string, text: string, accent: string }} palette
 */
export function toCssVariables(palette) {
  return `:root {
  --emotion-bg: ${palette.background};
  --emotion-text: ${palette.text};
  --emotion-accent: ${palette.accent};
}`;
}
