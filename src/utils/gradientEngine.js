/**
 * Emotion-Based Pro Gradient Engine
 * Generates psychologically cohesive multi-stop gradients + export strings.
 */

// ─── Color helpers ────────────────────────────────────────────────────────────

export function hslToHex(h, s, l) {
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
  const to = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function hexToHsl(hex) {
  let h = (hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hh = 0;
  if (max === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hh = ((b - r) / d + 2) / 6;
  else hh = ((r - g) / d + 4) / 6;
  return { h: Math.round(hh * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ─── Emotion profiles ─────────────────────────────────────────────────────────

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   psychology: string,
 *   stops: Array<{ h: number, s: number, l: number, pos?: number }>,
 *   textOnGradient: string,
 *   subText: string,
 *   ctaBg: string,
 *   ctaText: string
 * }} GradientEmotionProfile
 */

/** @type {Record<string, GradientEmotionProfile>} */
export const GRADIENT_EMOTIONS = {
  energy: {
    id: "energy",
    label: "Energy & Passion",
    psychology:
      "Warm, high-saturation reds and oranges create urgency and approach motivation — ideal for launches and high-intent CTAs.",
    // Sharp fiery stops
    stops: [
      { h: 352, s: 88, l: 48, pos: 0 },
      { h: 18, s: 95, l: 52, pos: 38 },
      { h: 330, s: 80, l: 42, pos: 72 },
      { h: 8, s: 90, l: 38, pos: 100 },
    ],
    textOnGradient: "#FFFFFF",
    subText: "rgba(255,255,255,0.82)",
    ctaBg: "rgba(255,255,255,0.18)",
    ctaText: "#FFFFFF",
  },
  trust: {
    id: "trust",
    label: "Trust & Tech",
    psychology:
      "Deep blues dissolving into cyan signal reliability and digital calm — the corporate and product default for confidence.",
    stops: [
      { h: 222, s: 72, l: 18, pos: 0 },
      { h: 210, s: 78, l: 38, pos: 35 },
      { h: 192, s: 70, l: 48, pos: 70 },
      { h: 175, s: 55, l: 42, pos: 100 },
    ],
    textOnGradient: "#F0F9FF",
    subText: "rgba(240,249,255,0.8)",
    ctaBg: "rgba(255,255,255,0.16)",
    ctaText: "#F0F9FF",
  },
  growth: {
    id: "growth",
    label: "Growth & Fresh",
    psychology:
      "Earthy-to-bright greens with soft yellow lift communicate progress, health, and natural momentum.",
    stops: [
      { h: 158, s: 55, l: 22, pos: 0 },
      { h: 148, s: 62, l: 38, pos: 40 },
      { h: 92, s: 48, l: 48, pos: 75 },
      { h: 72, s: 55, l: 52, pos: 100 },
    ],
    textOnGradient: "#ECFDF5",
    subText: "rgba(236,253,245,0.82)",
    ctaBg: "rgba(255,255,255,0.16)",
    ctaText: "#ECFDF5",
  },
  luxury: {
    id: "luxury",
    label: "Luxury & Premium",
    psychology:
      "Deep purples with gold accents and dark contrast evoke exclusivity, ceremony, and refined night-mode prestige.",
    stops: [
      { h: 275, s: 48, l: 12, pos: 0 },
      { h: 268, s: 55, l: 28, pos: 40 },
      { h: 42, s: 62, l: 48, pos: 72 },
      { h: 280, s: 40, l: 18, pos: 100 },
    ],
    textOnGradient: "#FAF5FF",
    subText: "rgba(250,245,255,0.8)",
    ctaBg: "rgba(251,191,36,0.22)",
    ctaText: "#FEF3C7",
  },
  joy: {
    id: "joy",
    label: "Joy & Optimism",
    psychology:
      "Golden highs and coral warmth keep the mood open, friendly, and approachable for consumer brands.",
    stops: [
      { h: 38, s: 92, l: 55, pos: 0 },
      { h: 22, s: 88, l: 58, pos: 45 },
      { h: 48, s: 85, l: 62, pos: 78 },
      { h: 12, s: 80, l: 55, pos: 100 },
    ],
    textOnGradient: "#1C1917",
    subText: "rgba(28,25,23,0.72)",
    ctaBg: "rgba(28,25,23,0.12)",
    ctaText: "#1C1917",
  },
  calm: {
    id: "calm",
    label: "Calm & Soft",
    psychology:
      "Low-arousal cools and soft mints reduce cognitive load — serene gradients for wellness and focus tools.",
    stops: [
      { h: 200, s: 35, l: 88, pos: 0 },
      { h: 185, s: 40, l: 78, pos: 40 },
      { h: 210, s: 32, l: 82, pos: 70 },
      { h: 170, s: 28, l: 90, pos: 100 },
    ],
    textOnGradient: "#0F172A",
    subText: "rgba(15,23,42,0.65)",
    ctaBg: "rgba(15,23,42,0.1)",
    ctaText: "#0F172A",
  },
};

export const GRADIENT_TYPES = [
  { id: "linear", label: "Linear", needsAngle: true },
  { id: "radial", label: "Radial", needsAngle: false },
  { id: "conic", label: "Conic", needsAngle: true },
  { id: "mesh", label: "Mesh", needsAngle: false },
];

export const EMOTION_OPTIONS = Object.values(GRADIENT_EMOTIONS).map((e) => ({
  id: e.id,
  label: e.label,
}));

/**
 * Build color stop objects from emotion profile (+ optional seed variation).
 * @param {string} emotionId
 * @param {{ variation?: number }} [opts]
 * @returns {Array<{ hex: string, h: number, s: number, l: number, pos: number }>}
 */
export function generateEmotionStops(emotionId, opts = {}) {
  const profile = GRADIENT_EMOTIONS[emotionId] || GRADIENT_EMOTIONS.trust;
  const v = opts.variation || 0; // slight H shift for regenerate
  return profile.stops.map((stop, i) => {
    const h = (stop.h + v * (i % 2 === 0 ? 1 : -1) + 360) % 360;
    const hex = hslToHex(h, stop.s, stop.l);
    return {
      hex,
      h,
      s: stop.s,
      l: stop.l,
      pos: stop.pos ?? Math.round((i / (profile.stops.length - 1)) * 100),
    };
  });
}

/**
 * Build CSS background value for a gradient type.
 * @param {{
 *   type: 'linear'|'radial'|'conic'|'mesh',
 *   angle: number,
 *   stops: Array<{ hex: string, pos: number }>
 * }} state
 */
export function buildGradientCss({ type, angle, stops }) {
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopStr = sorted.map((s) => `${s.hex} ${s.pos}%`).join(", ");

  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${stopStr})`;
  }
  if (type === "radial") {
    return `radial-gradient(circle at 50% 40%, ${stopStr})`;
  }
  if (type === "conic") {
    return `conic-gradient(from ${angle}deg at 50% 50%, ${stopStr})`;
  }
  // Mesh: layered radials for trendy multi-orb look
  if (type === "mesh") {
    const c0 = sorted[0]?.hex || "#000";
    const c1 = sorted[1]?.hex || c0;
    const c2 = sorted[2]?.hex || c1;
    const c3 = sorted[3]?.hex || c2;
    return [
      `radial-gradient(at 15% 20%, ${c1} 0px, transparent 50%)`,
      `radial-gradient(at 85% 15%, ${c2} 0px, transparent 45%)`,
      `radial-gradient(at 70% 80%, ${c3} 0px, transparent 50%)`,
      `radial-gradient(at 25% 75%, ${c0} 0px, transparent 55%)`,
      `linear-gradient(160deg, ${c0} 0%, ${c2} 100%)`,
    ].join(", ");
  }
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

/**
 * Full style object for the preview container.
 */
export function buildGradientStyle({ type, angle, stops, isAnimated }) {
  const bg = buildGradientCss({ type, angle, stops });
  const style = {
    backgroundImage: bg,
    backgroundColor: stops[0]?.hex || "#0F172A",
    transition: "background 0.5s ease, background-image 0.5s ease",
  };
  if (isAnimated) {
    style.backgroundSize = type === "mesh" ? "100% 100%" : "200% 200%";
    style.animation = "seeuiGradientFlow 8s ease infinite";
  } else {
    style.backgroundSize = "100% 100%";
    style.animation = "none";
  }
  return style;
}

/**
 * Export: raw CSS (+ keyframes if animated)
 */
export function exportRawCss({ type, angle, stops, isAnimated, className = "hero-gradient" }) {
  const bg = buildGradientCss({ type, angle, stops });
  let css = `.${className} {
  background-image: ${bg};
  background-color: ${stops[0]?.hex || "#0F172A"};
`;
  if (isAnimated) {
    css += `  background-size: 200% 200%;
  animation: seeuiGradientFlow 8s ease infinite;
}
@keyframes seeuiGradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
  } else {
    css += `  background-size: cover;
}
`;
  }
  return css.trim();
}

/**
 * Tailwind arbitrary value class
 */
export function exportTailwindArbitrary({ type, angle, stops }) {
  const bg = buildGradientCss({ type, angle, stops });
  // Escape spaces for arbitrary value
  const escaped = bg.replace(/ /g, "_");
  return `bg-[${escaped}]`;
}

/**
 * tailwind.config.js theme extension snippet
 */
export function exportTailwindConfig({ type, angle, stops, name = "emotion" }) {
  const bg = buildGradientCss({ type, angle, stops });
  return `// SeeUI Emotion Gradient — paste into tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        '${name}-gradient': '${bg}',
      },
      animation: {
        'gradient-flow': 'seeuiGradientFlow 8s ease infinite',
      },
      keyframes: {
        seeuiGradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
};

// Usage:
// <div className="bg-${name}-gradient bg-[length:200%_200%] animate-gradient-flow" />`;
}

/**
 * Suggested solid palette from gradient (for workspace apply).
 */
export function gradientToWorkspacePalette(emotionId, stops) {
  const profile = GRADIENT_EMOTIONS[emotionId] || GRADIENT_EMOTIONS.trust;
  const bg = stops[0]?.hex || "#0F172A";
  const accent = stops[Math.min(1, stops.length - 1)]?.hex || "#6366F1";
  return {
    background: bg,
    text: profile.textOnGradient.startsWith("#")
      ? profile.textOnGradient
      : "#F8FAFC",
    accent,
    emotion: emotionId,
    label: profile.label,
  };
}
