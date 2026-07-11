/**
 * Procedural color-psychology palette generator.
 * Each palette: { id, emotion, mode, background, text, highlight, label }
 *
 * Rules (strict pairings):
 *  Trust/Safety/Calm  → blues + soft greys
 *  Energy/Love        → reds + dark contrasts
 *  Joy/Optimism       → warm yellows/ambers + soft neutrals
 *  Growth/Harmony     → greens + earth/cream
 *  Royalty/Creativity/Luxury → purples + gold/slate accents
 */

// ─── Emotion recipes ──────────────────────────────────────────────────────────
const RECIPES = [
  {
    id: "trust",
    label: "Trust",
    // Hue ranges (HSL)
    bg: { h: [205, 225], s: [25, 55], lDark: [10, 18], lLight: [94, 98] },
    text: { h: [210, 220], s: [8, 20], lDark: [90, 96], lLight: [18, 28] },
    highlight: { h: [210, 225], s: [65, 90], l: [48, 62] },
  },
  {
    id: "safety",
    label: "Safety",
    bg: { h: [200, 215], s: [20, 40], lDark: [11, 17], lLight: [95, 98] },
    text: { h: [210, 220], s: [10, 22], lDark: [88, 95], lLight: [20, 30] },
    highlight: { h: [198, 215], s: [55, 80], l: [45, 58] },
  },
  {
    id: "calm",
    label: "Calm",
    bg: { h: [195, 215], s: [18, 38], lDark: [12, 20], lLight: [95, 98] },
    text: { h: [200, 215], s: [8, 18], lDark: [88, 94], lLight: [22, 32] },
    highlight: { h: [190, 210], s: [40, 65], l: [50, 65] },
  },
  {
    id: "energy",
    label: "Energy",
    bg: { h: [0, 15], s: [40, 70], lDark: [8, 14], lLight: [95, 98] },
    text: { h: [0, 10], s: [5, 15], lDark: [92, 98], lLight: [12, 20] },
    highlight: { h: [0, 12], s: [75, 95], l: [48, 58] },
  },
  {
    id: "love",
    label: "Love",
    bg: { h: [340, 355], s: [35, 60], lDark: [10, 16], lLight: [95, 98] },
    text: { h: [340, 350], s: [8, 20], lDark: [92, 98], lLight: [18, 28] },
    highlight: { h: [340, 355], s: [70, 90], l: [50, 60] },
  },
  {
    id: "joy",
    label: "Joy",
    bg: { h: [40, 52], s: [35, 60], lDark: [10, 16], lLight: [95, 98] },
    text: { h: [35, 45], s: [10, 25], lDark: [92, 98], lLight: [18, 28] },
    highlight: { h: [38, 48], s: [80, 95], l: [48, 58] },
  },
  {
    id: "optimism",
    label: "Optimism",
    bg: { h: [30, 42], s: [30, 55], lDark: [11, 17], lLight: [95, 98] },
    text: { h: [28, 40], s: [12, 28], lDark: [90, 96], lLight: [20, 30] },
    highlight: { h: [28, 40], s: [75, 92], l: [50, 60] },
  },
  {
    id: "growth",
    label: "Growth",
    bg: { h: [145, 165], s: [30, 55], lDark: [9, 15], lLight: [95, 98] },
    text: { h: [150, 160], s: [8, 20], lDark: [90, 96], lLight: [16, 26] },
    highlight: { h: [145, 160], s: [65, 90], l: [42, 55] },
  },
  {
    id: "harmony",
    label: "Harmony",
    bg: { h: [155, 175], s: [22, 45], lDark: [10, 16], lLight: [95, 98] },
    text: { h: [160, 170], s: [8, 18], lDark: [90, 96], lLight: [18, 28] },
    highlight: { h: [155, 170], s: [50, 75], l: [42, 55] },
  },
  {
    id: "royalty",
    label: "Royalty",
    bg: { h: [265, 285], s: [35, 60], lDark: [9, 15], lLight: [96, 98] },
    text: { h: [270, 280], s: [10, 22], lDark: [92, 98], lLight: [18, 28] },
    highlight: { h: [270, 285], s: [65, 90], l: [52, 62] },
  },
  {
    id: "creativity",
    label: "Creativity",
    bg: { h: [275, 295], s: [30, 55], lDark: [10, 16], lLight: [96, 98] },
    text: { h: [280, 290], s: [8, 20], lDark: [92, 98], lLight: [20, 30] },
    highlight: { h: [280, 300], s: [70, 92], l: [55, 65] },
  },
  {
    id: "luxury",
    label: "Luxury",
    bg: { h: [255, 275], s: [25, 50], lDark: [8, 14], lLight: [96, 98] },
    text: { h: [45, 50], s: [15, 40], lDark: [88, 94], lLight: [18, 28] }, // soft gold-tinted text on light
    highlight: { h: [42, 50], s: [55, 80], l: [48, 58] }, // gold highlight
  },
];

// Soft grey companions used with trust/calm (psychology: blue + soft grey)
const GREY_TEXT_DARK = { h: [210, 220], s: [6, 14], l: [88, 94] };
const GREY_TEXT_LIGHT = { h: [215, 225], s: [8, 16], l: [22, 32] };

// ─── Color math ───────────────────────────────────────────────────────────────
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(range) {
  return rand(range[0], range[1]);
}

function hslToHex(h, s, l) {
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
  const toHex = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function sampleChannel(spec, mode, role) {
  const h = pick(spec.h);
  const s = pick(spec.s);
  let l;
  if (role === "highlight") {
    l = pick(spec.l);
  } else if (mode === "dark") {
    l = pick(spec.lDark);
  } else {
    l = pick(spec.lLight);
  }
  return hslToHex(h, s, l);
}

let _idSeq = 0;
function nextId() {
  _idSeq += 1;
  return `pal-${Date.now().toString(36)}-${_idSeq}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Generate one psychology-based palette.
 * @param {{ emotionId?: string, mode?: 'dark'|'light' }} [opts]
 * @returns {{
 *   id: string,
 *   emotion: string,
 *   label: string,
 *   mode: 'dark'|'light',
 *   background: string,
 *   text: string,
 *   highlight: string,
 *   BackgroundColor: string,
 *   TextColor: string,
 *   HighlightColor: string
 * }}
 */
export function generatePsychologyPalette(opts = {}) {
  const recipe =
    RECIPES.find((r) => r.id === opts.emotionId) ||
    RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const mode =
    opts.mode || (Math.random() > 0.45 ? "dark" : "light");

  const background = sampleChannel(recipe.bg, mode, "bg");

  // Trust / Safety / Calm → soft greys for text (psychology pairing)
  let text;
  if (["trust", "safety", "calm"].includes(recipe.id)) {
    const grey = mode === "dark" ? GREY_TEXT_DARK : GREY_TEXT_LIGHT;
    text = hslToHex(pick(grey.h), pick(grey.s), pick(grey.l));
  } else {
    text = sampleChannel(recipe.text, mode, "text");
  }

  const highlight = sampleChannel(recipe.highlight, mode, "highlight");

  return {
    id: nextId(),
    emotion: recipe.id,
    label: recipe.label,
    mode,
    background,
    text,
    highlight,
    // Explicit aliases required by the brief
    BackgroundColor: background,
    TextColor: text,
    HighlightColor: highlight,
  };
}

/**
 * Generate N unique palettes, cycling emotions for variety.
 * @param {number} count
 * @param {{ seedEmotions?: boolean }} [opts]
 * @returns {ReturnType<typeof generatePsychologyPalette>[]}
 */
export function generatePsychologyPalettes(count = 30) {
  const list = [];
  const seen = new Set();

  for (let i = 0; i < count; i++) {
    // Cycle emotions for coverage, then free-roll for uniqueness
    const emotionId = RECIPES[i % RECIPES.length].id;
    const mode = i % 2 === 0 ? "dark" : "light";

    let palette;
    let attempts = 0;
    do {
      palette = generatePsychologyPalette({
        emotionId: attempts < 3 ? emotionId : undefined,
        mode: attempts < 2 ? mode : undefined,
      });
      attempts += 1;
    } while (
      seen.has(`${palette.background}${palette.text}${palette.highlight}`) &&
      attempts < 12
    );

    seen.add(`${palette.background}${palette.text}${palette.highlight}`);
    list.push(palette);
  }

  // Shuffle so grid doesn't look striped by emotion
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
}

export const PSYCHOLOGY_EMOTIONS = RECIPES.map((r) => ({
  id: r.id,
  label: r.label,
}));
