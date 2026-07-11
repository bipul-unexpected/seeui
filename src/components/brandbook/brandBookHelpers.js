/**
 * Brand Book data model — full workspace snapshot for print-ready PDFs.
 * Captures palette, emotion psychology, typography, WCAG, tokens, history.
 */

import { EMOTIONS, COLOR_FAMILIES } from "../../data/emotionColors";
import {
  getTypographyForEmotion,
  DEFAULT_TYPOGRAPHY_PAIR,
  toGoogleFontsImport,
} from "../../data/emotionTypography";
import { getPrintColorCodes } from "../../utils/colorPrint";
import {
  getWcagReport,
  getRelativeLuminance,
  normalizeHex,
} from "../../utils/wcagContrast";
import { toCssVariables, toHexArray, toTailwindConfig } from "../../utils/exportPalette";

const TOTAL_PAGES = 6;

/**
 * @param {string|null|undefined} emotionId
 */
export function resolveEmotionMeta(emotionId) {
  const key = String(emotionId || "trust").toLowerCase().trim();
  const emotion =
    EMOTIONS.find((e) => e.id === key) ||
    EMOTIONS.find((e) => e.label.toLowerCase() === key) ||
    EMOTIONS.find((e) => e.id === "trust");

  const family = COLOR_FAMILIES[emotion?.family] || COLOR_FAMILIES.blue;
  return {
    id: emotion?.id || "trust",
    label: emotion?.label || "Trust",
    emoji: emotion?.emoji || "◆",
    familyId: emotion?.family || "blue",
    familyName: family.name,
    familyPsychology: family.psychology,
    avoid: Array.isArray(emotion?.avoid) ? emotion.avoid : [],
    weight: emotion?.weight || 1,
  };
}

/**
 * Soft mix of two hex colors (0–1 weight toward b).
 */
export function mixHex(a, b, t = 0.5) {
  const A = getPrintColorCodes(a).rgb;
  const B = getPrintColorCodes(b).rgb;
  const m = (x, y) => Math.round(x + (y - x) * t);
  const r = m(A.r, B.r);
  const g = m(A.g, B.g);
  const bl = m(A.b, B.b);
  const hex = `#${[r, g, bl]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
  return getPrintColorCodes(hex);
}

/**
 * Build design rationale paragraph.
 */
export function buildDesignRationale({
  emotion,
  typography,
  background,
  accent,
  text,
  mode,
} = {}) {
  const meta = resolveEmotionMeta(emotion);
  const pair =
    typography?.psychology != null
      ? typography
      : getTypographyForEmotion(emotion || meta.id);

  const headingName =
    typeof typography?.heading === "string"
      ? typography.heading
      : typography?.heading?.name || pair.heading?.name || "Inter";
  const bodyName =
    typeof typography?.body === "string"
      ? typography.body
      : typography?.body?.name || pair.body?.name || "Inter";

  const bg = normalizeHex(background) || "#FFFFFF";
  const ac = normalizeHex(accent) || "#2563EB";
  const tx = normalizeHex(text) || "#0F172A";

  return (
    `This brand system is engineered around the primary emotion of ${meta.label}. ` +
    `${meta.familyName} color psychology (${meta.familyPsychology.toLowerCase()}) anchors the palette in a ${mode || "balanced"} interface mode. ` +
    `Background ${bg}, text ${tx}, and primary accent ${ac} are calibrated together for product UI clarity and print handoff. ` +
    `Typography pairs ${headingName} for hierarchy with ${bodyName} for long-form readability — ${pair.psychology || "balancing authority with approachability."} ` +
    `Use this document as the single source of truth for digital product surfaces, marketing assets, and vendor print specs.`
  );
}

function formatDateTime(d = new Date()) {
  try {
    return {
      date: d.toISOString().slice(0, 10),
      time: d.toISOString().slice(11, 16) + " UTC",
      iso: d.toISOString(),
      display: d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    const iso = new Date().toISOString();
    return { date: iso.slice(0, 10), time: "", iso, display: iso.slice(0, 16) };
  }
}

/**
 * Normalize recent history entries for PDF (max 8).
 */
function normalizeHistory(recent = []) {
  if (!Array.isArray(recent)) return [];
  return recent.slice(0, 8).map((entry, i) => {
    const bg = normalizeHex(entry.background || entry.bg) || "#0F172A";
    const tx = normalizeHex(entry.text) || "#F8FAFC";
    const ac =
      normalizeHex(entry.accent || entry.highlight) || tx;
    return {
      index: i + 1,
      label: entry.label || entry.source || `Palette ${i + 1}`,
      source: entry.source || "workspace",
      emotion: entry.emotion || entry.emotionId || null,
      background: bg,
      text: tx,
      accent: ac,
      at: entry.savedAt || entry.at || entry.timestamp || null,
    };
  });
}

/**
 * Build complete brand book model from live workspace props.
 * @param {object} props
 */
export function buildBrandBookModel(props = {}) {
  const background = normalizeHex(props.background) || "#FFFFFF";
  const text = normalizeHex(props.text) || "#0F172A";
  const accent =
    normalizeHex(props.accent || props.highlight) ||
    normalizeHex(props.text) ||
    "#2563EB";

  const emotionMeta = resolveEmotionMeta(props.emotion || props.emotionId);
  // Enrich avoid from EMOTIONS if missing on meta
  if (!emotionMeta.avoid?.length) {
    const full = EMOTIONS.find((e) => e.id === emotionMeta.id);
    emotionMeta.avoid = full?.avoid || [];
  }

  const basePair = getTypographyForEmotion(emotionMeta.id) || DEFAULT_TYPOGRAPHY_PAIR;
  const typePair =
    props.typography?.heading && props.typography?.body
      ? {
          ...basePair,
          ...props.typography,
          heading:
            typeof props.typography.heading === "string"
              ? { name: props.typography.heading, family: props.typography.heading }
              : props.typography.heading,
          body:
            typeof props.typography.body === "string"
              ? { name: props.typography.body, family: props.typography.body }
              : props.typography.body,
        }
      : basePair;

  const muted = mixHex(text, background, 0.45);
  const surface = mixHex(background, text, 0.06);
  const border = mixHex(background, text, 0.14);
  const accentSoft = mixHex(accent, background, 0.75);

  const colors = {
    background: getPrintColorCodes(background),
    text: getPrintColorCodes(text),
    accent: getPrintColorCodes(accent),
    muted,
    surface,
    border,
    accentSoft,
  };

  // WCAG matrix — all critical pairings
  const wcag = {
    textOnBg: getWcagReport(text, background),
    accentOnBg: getWcagReport(accent, background),
    textOnAccent: getWcagReport(text, accent),
    whiteOnAccent: getWcagReport("#FFFFFF", accent),
    blackOnAccent: getWcagReport("#000000", accent),
    whiteOnBg: getWcagReport("#FFFFFF", background),
    blackOnBg: getWcagReport("#000000", background),
    mutedOnBg: getWcagReport(muted.hex, background),
  };

  const isDark =
    props.isDark != null
      ? Boolean(props.isDark)
      : getRelativeLuminance(background) < 0.35;
  const mode = props.mode || (isDark ? "dark" : "light");

  const emotionTypeActive =
    props.emotionTypeActive != null ? Boolean(props.emotionTypeActive) : true;

  const manualFont = {
    name: props.manualFontName || props.fontName || null,
    slug: props.fontSlug || null,
    weight: props.fontWeight || 700,
    size: props.fontSize || 56,
    family: props.manualFontFamily || null,
  };

  const headingFontName =
    typePair.heading?.name ||
    (typeof typePair.heading === "string" ? typePair.heading : "Inter");
  const bodyFontName =
    typePair.body?.name ||
    (typeof typePair.body === "string" ? typePair.body : "Inter");

  // Active display fonts as used in the live UI
  const activeHeadingName = emotionTypeActive
    ? headingFontName
    : manualFont.name || headingFontName;
  const activeBodyName = emotionTypeActive
    ? bodyFontName
    : manualFont.name || bodyFontName;

  const typeScale = buildTypeScale(manualFont.size || 56);

  const paletteForExport = {
    background,
    text,
    accent,
    highlight: accent,
    emotion: emotionMeta.id,
    typography: typePair,
  };

  const tokens = {
    css: toCssVariables(paletteForExport),
    tailwind: toTailwindConfig(paletteForExport),
    hexArray: toHexArray(paletteForExport),
    googleImport: toGoogleFontsImport(typePair),
  };

  const rationale =
    props.rationale ||
    buildDesignRationale({
      emotion: emotionMeta.id,
      typography: typePair,
      background,
      accent,
      text,
      mode,
    });

  const when = formatDateTime(
    props.generatedAt ? new Date(props.generatedAt) : new Date(),
  );

  const history = normalizeHistory(props.recent || props.history || []);

  const usageRoles = [
    {
      role: "Background / Canvas",
      hex: background,
      usage: "Page surfaces, app shells, hero fills, large regions",
      do: "Keep large areas calm; avoid heavy patterns over brand bg",
      dont: "Do not place low-contrast text or icons on busy overlays",
    },
    {
      role: "Text / Ink",
      hex: text,
      usage: "Body copy, headings, icons, form labels, navigation",
      do: "Maintain AA+ contrast vs background for all body text",
      dont: "Do not use text color for decorative fills or charts alone",
    },
    {
      role: "Primary / Accent",
      hex: accent,
      usage: "CTAs, links, focus rings, key highlights, brand mark",
      do: "Reserve for interactive emphasis and primary actions",
      dont: "Do not flood large surfaces; accent loses meaning if overused",
    },
    {
      role: "Muted / Secondary",
      hex: muted.hex,
      usage: "Captions, meta, placeholders, secondary labels",
      do: "Use for hierarchy under primary text",
      dont: "Do not use muted color for critical instructions",
    },
  ];

  const designSpecs = {
    spacingBase: 8,
    radiusSm: 6,
    radiusMd: 10,
    radiusLg: 16,
    radiusPill: 999,
    shadow: isDark
      ? "0 12px 40px rgba(0,0,0,0.45)"
      : "0 12px 40px rgba(15,23,42,0.12)",
    focusRing: `0 0 0 3px ${accent}55`,
    maxContentWidth: 1120,
    bodyLineHeight: 1.6,
    headingLineHeight: 1.15,
  };

  return {
    totalPages: TOTAL_PAGES,
    background,
    text,
    accent,
    colors,
    usageRoles,
    designSpecs,
    emotion: emotionMeta,
    typography: typePair,
    headingFontName,
    bodyFontName,
    activeHeadingName,
    activeBodyName,
    emotionTypeActive,
    manualFont,
    typeScale,
    pdfFonts: props.pdfFonts || null,
    wcag,
    luminance: {
      background: getRelativeLuminance(background),
      text: getRelativeLuminance(text),
      accent: getRelativeLuminance(accent),
    },
    isDark,
    mode,
    textIsAuto: Boolean(props.textIsAuto),
    rationale,
    generatedAt: when.date,
    generatedDisplay: when.display,
    generatedIso: when.iso,
    brandName: props.brandName || "SeeUI",
    documentTitle: props.documentTitle || "Brand Style Guidelines",
    documentVersion: props.documentVersion || "1.0",
    documentStatus: props.documentStatus || "Working draft — live workspace export",
    productTagline:
      props.productTagline ||
      "Emotion-Based Color Psychology · Typography · Accessibility",
    history,
    tokens,
    logoUrl: props.logoUrl || null,
    logoPresent: Boolean(props.logoUrl),
    sourceLabel: props.sourceLabel || "SeeUI Workspace",
    workspaceSummary: {
      primaryEmotion: emotionMeta.label,
      colorMode: mode,
      typeMode: emotionTypeActive ? "Emotion pairing" : "Manual typography board",
      heading: activeHeadingName,
      body: activeBodyName,
      heroSize: `${manualFont.size || 56}px`,
      heroWeight: String(manualFont.weight || 700),
      contrast: wcag.textOnBg.ratioLabel,
      wcagLevel: wcag.textOnBg.level,
      historyCount: history.length,
    },
  };
}

/**
 * Type scale derived from user's hero font size preference.
 */
export function buildTypeScale(heroPx = 56) {
  const h1 = Math.min(Math.max(heroPx * 0.55, 28), 40);
  const h2 = Math.round(h1 * 0.72);
  const h3 = Math.round(h1 * 0.55);
  return [
    {
      role: "H1 · Display",
      pt: Math.round(h1),
      px: Math.round(h1 * 1.333),
      sample: "The quick brown fox jumps over the lazy dog",
      usage: "Hero headlines, page titles, campaign statements",
      font: "heading",
      weight: 700,
    },
    {
      role: "H2 · Section",
      pt: Math.round(h2),
      px: Math.round(h2 * 1.333),
      sample: "The quick brown fox jumps over the lazy dog",
      usage: "Section titles, card headers, modal titles",
      font: "heading",
      weight: 700,
    },
    {
      role: "H3 · Subsection",
      pt: Math.round(h3),
      px: Math.round(h3 * 1.333),
      sample: "Structured hierarchy keeps interfaces scannable",
      usage: "Subheads, list group titles, feature labels",
      font: "heading",
      weight: 600,
    },
    {
      role: "Body · Paragraph",
      pt: 11,
      px: 15,
      sample:
        "Emotion-driven design pairs intentional color psychology with typographic hierarchy. Use the heading face for titles; reserve the body face for paragraphs, labels, and long-form content.",
      usage: "Body copy, descriptions, form help text",
      font: "body",
      weight: 400,
    },
    {
      role: "Caption · Meta",
      pt: 8,
      px: 11,
      sample:
        "Labels, timestamps, legal footnotes, and table headers. Never set body copy below 9pt in print.",
      usage: "Meta, captions, table headers, footnotes",
      font: "body",
      weight: 400,
    },
  ];
}

/**
 * WCAG badge label for PDF.
 */
export function formatWcagBadge(report) {
  if (!report) return { text: "FAIL", pass: false };
  if (report.passAAA) return { text: "PASS (AAA)", pass: true };
  if (report.passAA || report.pass) return { text: "PASS (AA)", pass: true };
  if (report.level === "AA Large") return { text: "PASS (AA Large)", pass: true };
  return { text: "FAIL", pass: false };
}

export function pageLabel(n, total = TOTAL_PAGES) {
  return `${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export { TOTAL_PAGES };
