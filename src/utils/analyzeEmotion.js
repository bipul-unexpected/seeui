/**
 * Color-to-emotion algorithm — analyzes HSL of an extracted palette.
 */

/**
 * @typedef {{
 *   emotionId: string,
 *   emotionName: string,
 *   psychologySummary: string,
 *   confidence: number,
 *   scores: Record<string, number>,
 *   recommendedTypography: { heading: string, body: string, headingFamily: string, bodyFamily: string },
 *   suggestedPalette: { background: string, text: string, accent: string }
 * }} EmotionResult
 */

const EMOTION_META = {
  energy: {
    emotionName: "Energy & Passion",
    psychologySummary:
      "Warm, highly saturated hues signal urgency, vitality, and approach motivation. Brands in this space feel bold, kinetic, and action-oriented — ideal for launches, sales, and high-intent CTAs.",
    typography: {
      heading: "Montserrat",
      body: "Roboto",
      headingFamily: '"Montserrat", system-ui, sans-serif',
      bodyFamily: '"Roboto", system-ui, sans-serif',
    },
  },
  trust: {
    emotionName: "Trust & Serenity",
    psychologySummary:
      "Cool blues at balanced lightness evoke reliability, calm focus, and professional composure. This emotional profile suits dashboards, fintech, and products that need long-session comfort.",
    typography: {
      heading: "Merriweather",
      body: "Open Sans",
      headingFamily: '"Merriweather", Georgia, serif',
      bodyFamily: '"Open Sans", system-ui, sans-serif',
    },
  },
  growth: {
    emotionName: "Growth & Safety",
    psychologySummary:
      "Greens and earthy mid-tones communicate progress, balance, and grounded safety. Viewers read this palette as healthy, sustainable, and steady — strong for wellness and analytics narratives.",
    typography: {
      heading: "Libre Baskerville",
      body: "Source Sans 3",
      headingFamily: '"Libre Baskerville", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    },
  },
  joy: {
    emotionName: "Joy & Optimism",
    psychologySummary:
      "Bright yellows and golden highs radiate optimism and approachability. High lightness keeps the mood open and friendly, perfect for consumer brands, education, and playful commerce.",
    typography: {
      heading: "Fredoka",
      body: "Quicksand",
      headingFamily: '"Fredoka", system-ui, sans-serif',
      bodyFamily: '"Quicksand", system-ui, sans-serif',
    },
  },
  mystery: {
    emotionName: "Mystery & Melancholy",
    psychologySummary:
      "Low lightness and muted chroma create depth, introspection, and quiet drama. This emotional space feels cinematic and premium when paired with restrained accents and elegant type.",
    typography: {
      heading: "Playfair Display",
      body: "Lato",
      headingFamily: '"Playfair Display", Georgia, serif',
      bodyFamily: '"Lato", system-ui, sans-serif',
    },
  },
  luxury: {
    emotionName: "Luxury & Prestige",
    psychologySummary:
      "Deep purples with controlled saturation imply exclusivity and refined taste. The palette feels ceremonial and elevated — suited to premium products and night-mode editorial brands.",
    typography: {
      heading: "Cormorant",
      body: "Montserrat",
      headingFamily: '"Cormorant", Georgia, serif',
      bodyFamily: '"Montserrat", system-ui, sans-serif',
    },
  },
  love: {
    emotionName: "Love & Warmth",
    psychologySummary:
      "Rose and magenta-leaning warms foster intimacy and emotional closeness. Soft-to-medium saturation keeps the feeling romantic rather than aggressive, ideal for lifestyle storytelling.",
    typography: {
      heading: "Playfair Display",
      body: "Lato",
      headingFamily: '"Playfair Display", Georgia, serif',
      bodyFamily: '"Lato", system-ui, sans-serif',
    },
  },
  calm: {
    emotionName: "Calm & Neutrality",
    psychologySummary:
      "Balanced greys and low-chroma cools reduce cognitive load and visual stress. The image reads as quiet, organized, and modern — a safe default for tools and minimal product UI.",
    typography: {
      heading: "Inter",
      body: "Inter",
      headingFamily: '"Inter", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
    },
  },
};

/**
 * Score a single HSL sample into emotion buckets.
 * @param {{ h: number, s: number, l: number }} hsl
 * @param {number} weight 0–1
 */
function scoreHsl(hsl, weight = 1) {
  const { h, s, l } = hsl;
  const w = weight;
  const scores = {
    energy: 0,
    trust: 0,
    growth: 0,
    joy: 0,
    mystery: 0,
    luxury: 0,
    love: 0,
    calm: 0,
  };

  // Warm high-sat → Energy & Passion (red/orange ~0–45, also 345–360)
  const warm =
    h <= 45 || h >= 345 || (h > 45 && h < 55 && s > 55);
  if (warm && s >= 45 && l >= 20 && l <= 75) {
    scores.energy += (0.55 + s / 200) * w;
  }

  // Cool blue/cyan → Trust & Serenity (185–250)
  if (h >= 185 && h <= 250 && l >= 25 && l <= 80) {
    scores.trust += (0.5 + (s > 20 ? 0.25 : 0.1)) * w;
  }

  // Green / earthy → Growth & Safety (75–165)
  if (h >= 75 && h <= 165 && s >= 18 && l >= 18 && l <= 78) {
    scores.growth += (0.5 + s / 250) * w;
  }

  // Yellow / gold high lightness → Joy & Optimism (45–70)
  if (h >= 42 && h <= 72 && l >= 48 && s >= 30) {
    scores.joy += (0.55 + l / 250) * w;
  }

  // Low lightness overall → Mystery & Melancholy
  if (l <= 28) {
    scores.mystery += (0.6 + (100 - s) / 300) * w;
  } else if (l <= 38 && s <= 35) {
    scores.mystery += 0.35 * w;
  }

  // Purple / violet → Luxury (260–310)
  if (h >= 255 && h <= 315 && l >= 15 && l <= 65 && s >= 25) {
    scores.luxury += (0.55 + s / 220) * w;
  }

  // Rose / magenta → Love (310–345)
  if (h >= 310 && h < 345 && s >= 25 && l >= 25 && l <= 78) {
    scores.love += (0.5 + s / 240) * w;
  }

  // Neutral / low chroma → Calm
  if (s <= 18) {
    scores.calm += (0.45 + (l > 20 && l < 85 ? 0.2 : 0)) * w;
  }

  return scores;
}

function pickTextForBg(bgHex) {
  // simple luminance
  const h = bgHex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.5 ? "#0A0A0A" : "#F8FAFC";
}

/**
 * Analyze extracted colors and return primary emotion + recommendations.
 * @param {Array<{ hex: string, hsl: { h: number, s: number, l: number }, weight?: number, role?: string }>} colors
 * @returns {EmotionResult}
 */
export function analyzeEmotion(colors = []) {
  const scores = {
    energy: 0,
    trust: 0,
    growth: 0,
    joy: 0,
    mystery: 0,
    luxury: 0,
    love: 0,
    calm: 0,
  };

  if (!colors.length) {
    const meta = EMOTION_META.calm;
    return {
      emotionId: "calm",
      emotionName: meta.emotionName,
      psychologySummary: meta.psychologySummary,
      confidence: 0.2,
      scores,
      recommendedTypography: meta.typography,
      suggestedPalette: {
        background: "#0F172A",
        text: "#F8FAFC",
        accent: "#94A3B8",
      },
    };
  }

  // Weight primary background more; accents slightly less
  colors.forEach((c, i) => {
    const w =
      (c.weight ?? 1 / colors.length) *
      (c.role === "background" || i === 0 ? 1.35 : 1);
    const partial = scoreHsl(c.hsl, w);
    Object.keys(scores).forEach((k) => {
      scores[k] += partial[k];
    });
  });

  // Average lightness bias for mystery
  const avgL =
    colors.reduce((s, c) => s + (c.hsl?.l ?? 50), 0) / colors.length;
  if (avgL < 30) scores.mystery += 0.4;

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topId, topScore] = ranked[0];
  const totalScore = ranked.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = Math.min(0.98, Math.max(0.22, topScore / totalScore + 0.15));

  const meta = EMOTION_META[topId] || EMOTION_META.calm;
  const bg = colors[0]?.hex || "#0F172A";
  const accent =
    colors.find((c) => c.role === "accent")?.hex ||
    colors[1]?.hex ||
    colors[0]?.hex ||
    "#6366F1";

  return {
    emotionId: topId,
    emotionName: meta.emotionName,
    psychologySummary: meta.psychologySummary,
    confidence: Math.round(confidence * 100) / 100,
    scores,
    recommendedTypography: meta.typography,
    suggestedPalette: {
      background: bg,
      text: pickTextForBg(bg),
      accent,
    },
  };
}

export { EMOTION_META };
