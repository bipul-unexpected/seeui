/**
 * Modular export builders — selectable sections, code + AI README formats.
 * Always consume a full workspace snapshot (localStorage / live).
 */

import {
  generateColorScale,
  formatTailwindScaleConfig,
  formatCssScaleVariables,
  scaleColorName,
} from "./colorScaleEngine";
import {
  getTypographyForEmotion,
  toGoogleFontsImport,
} from "../data/emotionTypography";

/** Selectable export sections */
export const EXPORT_SECTIONS = [
  {
    id: "palette",
    label: "Core palette",
    description: "Background, text, accent HEX",
    defaultOn: true,
  },
  {
    id: "scale",
    label: "Color scale 50–950",
    description: "Full Tailwind design tokens",
    defaultOn: true,
  },
  {
    id: "typography",
    label: "Typography",
    description: "Heading + body fonts & Google import",
    defaultOn: true,
  },
  {
    id: "accessibility",
    label: "Accessibility (WCAG)",
    description: "Contrast ratios & pass/fail",
    defaultOn: true,
  },
  {
    id: "tokens",
    label: "Design tokens (CSS)",
    description: ":root variables for product UI",
    defaultOn: true,
  },
  {
    id: "tailwind",
    label: "Tailwind config",
    description: "theme.extend colors + fonts + scale",
    defaultOn: true,
  },
  {
    id: "history",
    label: "Session history",
    description: "Recent palettes from localStorage",
    defaultOn: true,
  },
  {
    id: "meta",
    label: "Workspace meta",
    description: "Emotion, mode, type settings, timestamps",
    defaultOn: true,
  },
];

export const DEFAULT_SELECTED = Object.fromEntries(
  EXPORT_SECTIONS.map((s) => [s.id, s.defaultOn]),
);

/**
 * @param {object} snapshot
 */
function pick(snapshot = {}) {
  const background = snapshot.background || "#0F172A";
  const text = snapshot.text || "#F8FAFC";
  const accent = snapshot.accent || snapshot.highlight || text;
  const emotion = snapshot.emotion || "trust";
  const typography =
    snapshot.typography || getTypographyForEmotion(emotion);
  const scale =
    snapshot.scale && typeof snapshot.scale === "object"
      ? snapshot.scale
      : generateColorScale(accent);
  const colorName = scaleColorName(emotion);
  return {
    background,
    text,
    accent,
    emotion,
    emotionLabel: snapshot.emotionLabel || typography?.label || emotion,
    typography,
    scale,
    colorName,
    isDark: Boolean(snapshot.isDark),
    mode: snapshot.mode || (snapshot.isDark ? "dark" : "light"),
    fontWeight: snapshot.fontWeight ?? 700,
    fontSize: snapshot.fontSize ?? 56,
    emotionTypeActive: snapshot.emotionTypeActive !== false,
    manualFontName: snapshot.manualFontName,
    textIsAuto: Boolean(snapshot.textIsAuto),
    recent: Array.isArray(snapshot.recent) ? snapshot.recent : [],
    wcag: snapshot.wcag || {},
    brandName: snapshot.brandName || "SeeUI",
    updatedAtIso: snapshot.updatedAtIso || new Date().toISOString(),
    sourceLabel: snapshot.sourceLabel || "SeeUI Workspace",
  };
}

function sectionOn(selected, id) {
  if (!selected || typeof selected !== "object") return true;
  return selected[id] !== false;
}

// ─── Individual builders ─────────────────────────────────────────────────────

export function buildPaletteSection(s) {
  return `/**
 * Core psychology palette
 * Emotion: ${s.emotionLabel} (${s.emotion})
 * Mode: ${s.mode}
 * Generated: ${s.updatedAtIso}
 */
export const palette = {
  background: "${s.background}",
  text: "${s.text}",
  accent: "${s.accent}",
  /** Alias used in some SeeUI exports */
  highlight: "${s.accent}",
};
`;
}

export function buildScaleSection(s) {
  const lines = Object.keys(s.scale)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `  ${k}: "${String(s.scale[k]).toLowerCase()}",`)
    .join("\n");
  return `/**
 * Tailwind-style design system scale (50–950)
 * Base 500 = primary emotion accent ${s.accent}
 */
export const ${s.colorName}Scale = {
${lines}
};
`;
}

export function buildTypographySection(s) {
  const h = s.typography?.heading?.name || "Inter";
  const b = s.typography?.body?.name || "Inter";
  const importLine = toGoogleFontsImport(s.typography) || "";
  return `/**
 * Emotion typography pair
 * ${s.typography?.psychology || "Heading for hierarchy · body for reading"}
 * Mode: ${s.emotionTypeActive ? "Emotion pairing" : "Manual typography board"}
 * Hero: weight ${s.fontWeight} · size ${s.fontSize}px
${s.manualFontName ? ` * Manual board font: ${s.manualFontName}\n` : ""} */
${importLine ? `${importLine}\n` : ""}
export const typography = {
  heading: "${h}",
  body: "${b}",
  emotion: "${s.emotion}",
  label: "${s.emotionLabel}",
  fontWeight: ${s.fontWeight},
  fontSize: ${s.fontSize},
};
`;
}

export function buildAccessibilitySection(s) {
  const t = s.wcag?.textOnBg || {};
  const a = s.wcag?.accentOnBg || {};
  const w = s.wcag?.whiteOnAccent || {};
  return `/**
 * WCAG 2.1 contrast snapshot (from last workspace state)
 * Always re-check after palette changes before shipping.
 */
export const accessibility = {
  textOnBackground: {
    ratio: "${t.ratioLabel || "—"}",
    level: "${t.level || "—"}",
    pass: ${t.pass === true},
  },
  accentOnBackground: {
    ratio: "${a.ratioLabel || "—"}",
    level: "${a.level || "—"}",
    pass: ${a.pass === true},
  },
  whiteOnAccent: {
    ratio: "${w.ratioLabel || "—"}",
    level: "${w.level || "—"}",
    pass: ${w.pass === true},
  },
};
`;
}

export function buildTokensSection(s) {
  const importLine = toGoogleFontsImport(s.typography) || "";
  const scaleVars = Object.keys(s.scale)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `  --color-${s.colorName}-${k}: ${s.scale[k]};`)
    .join("\n");

  return `/**
 * CSS design tokens — paste into global stylesheet
 * Source: ${s.sourceLabel} · ${s.updatedAtIso}
 */
${importLine ? `${importLine}\n` : ""}
:root {
  /* Core palette */
  --color-bg: ${s.background};
  --color-text: ${s.text};
  --color-primary: ${s.accent};
  --color-highlight: ${s.accent};

  /* Typography */
  --font-heading: ${s.typography?.heading?.family || `"${s.typography?.heading?.name || "Inter"}", system-ui, sans-serif`};
  --font-body: ${s.typography?.body?.family || `"${s.typography?.body?.name || "Inter"}", system-ui, sans-serif`};

  /* Full scale */
${scaleVars}
}

/* Suggested usage
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}
h1, h2, h3 { font-family: var(--font-heading); }
.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
}
*/
`;
}

export function buildTailwindSection(s) {
  const scaleBlock = Object.keys(s.scale)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `          ${k}: "${String(s.scale[k]).toLowerCase()}",`)
    .join("\n");
  const h = s.typography?.heading?.name || "Inter";
  const b = s.typography?.body?.name || "Inter";
  const hCat = s.typography?.heading?.category === "serif" ? "serif" : "sans-serif";

  return `/**
 * Tailwind CSS theme extension
 * Paste into tailwind.config.js → theme.extend
 * Emotion: ${s.emotionLabel} · ${s.updatedAtIso}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "${s.background}",
          text: "${s.text}",
          highlight: "${s.accent}",
          DEFAULT: "${s.accent}",
        },
        ${s.colorName}: {
${scaleBlock}
        },
      },
      fontFamily: {
        heading: ["${h}", "${hCat === "serif" ? "Georgia" : "system-ui"}", "${hCat}"],
        body: ["${b}", "system-ui", "sans-serif"],
      },
    },
  },
};
`;
}

export function buildHistorySection(s) {
  if (!s.recent?.length) {
    return `/**
 * Session history
 * No recent palettes stored yet in localStorage.
 */
export const history = [];
`;
  }
  const items = s.recent
    .slice(0, 12)
    .map((e, i) => {
      const bg = e.background || e.BackgroundColor || "";
      const tx = e.text || e.TextColor || "";
      const ac = e.accent || e.highlight || e.HighlightColor || "";
      return `  {
    index: ${i + 1},
    label: ${JSON.stringify(e.label || "Palette")},
    source: ${JSON.stringify(e.source || "workspace")},
    emotion: ${JSON.stringify(e.emotion || null)},
    background: "${bg}",
    text: "${tx}",
    accent: "${ac}",
  },`;
    })
    .join("\n");

  return `/**
 * Recent palette history (localStorage · last session work)
 * Ordered newest-first as saved by SeeUI.
 */
export const history = [
${items}
];
`;
}

export function buildMetaSection(s) {
  return `/**
 * Workspace metadata — last saved SeeUI state
 */
export const workspaceMeta = {
  brandName: "${s.brandName}",
  source: "${s.sourceLabel}",
  emotion: "${s.emotion}",
  emotionLabel: "${s.emotionLabel}",
  mode: "${s.mode}",
  isDark: ${s.isDark},
  textIsAuto: ${s.textIsAuto},
  emotionTypeActive: ${s.emotionTypeActive},
  fontWeight: ${s.fontWeight},
  fontSize: ${s.fontSize},
  updatedAt: "${s.updatedAtIso}",
};
`;
}

/**
 * Full modular JS code export from selected sections.
 * @param {object} snapshot
 * @param {Record<string, boolean>} selected
 */
export function buildCodeBundle(snapshot, selected = DEFAULT_SELECTED) {
  const s = pick(snapshot);
  const parts = [
    `/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SeeUI · Full Design System Export
 *  Emotion-Based Color Psychology Generator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  This file was generated from the user's LAST workspace state
 *  (persisted in browser localStorage + live UI).
 *
 *  Emotion:  ${s.emotionLabel} (${s.emotion})
 *  Mode:     ${s.mode}
 *  Updated:  ${s.updatedAtIso}
 *  Source:   ${s.sourceLabel}
 *
 *  How to use:
 *  1. Copy sections you need into your design system / app tokens
 *  2. Or paste the Tailwind block into tailwind.config.js
 *  3. Or use CSS :root tokens in your global stylesheet
 *
 *  Sections included: ${EXPORT_SECTIONS.filter((x) => sectionOn(selected, x.id)).map((x) => x.id).join(", ") || "(none)"}
 * ═══════════════════════════════════════════════════════════════════════════
 */

`,
  ];

  if (sectionOn(selected, "meta")) parts.push(buildMetaSection(s));
  if (sectionOn(selected, "palette")) parts.push(buildPaletteSection(s));
  if (sectionOn(selected, "scale")) parts.push(buildScaleSection(s));
  if (sectionOn(selected, "typography")) parts.push(buildTypographySection(s));
  if (sectionOn(selected, "accessibility"))
    parts.push(buildAccessibilitySection(s));
  if (sectionOn(selected, "tokens")) parts.push(buildTokensSection(s));
  if (sectionOn(selected, "tailwind")) parts.push(buildTailwindSection(s));
  if (sectionOn(selected, "history")) parts.push(buildHistorySection(s));

  if (parts.length === 1) {
    parts.push(
      `// No sections selected — enable at least one export section in the Export Studio.\n`,
    );
  }

  return parts.join("\n");
}

/**
 * README.md optimized for AI coding agents (Cursor, Claude, Copilot, etc.)
 * @param {object} snapshot
 * @param {Record<string, boolean>} selected
 */
export function buildReadmeForAi(snapshot, selected = DEFAULT_SELECTED) {
  const s = pick(snapshot);
  const scaleRows = Object.keys(s.scale)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `| ${k} | \`${s.scale[k]}\` |`)
    .join("\n");

  const historyMd =
    sectionOn(selected, "history") && s.recent?.length
      ? s.recent
          .slice(0, 10)
          .map(
            (e, i) =>
              `${i + 1}. **${e.label || "Palette"}** (\`${e.source || "workspace"}\`) — bg \`${e.background || e.BackgroundColor}\` · text \`${e.text || e.TextColor}\` · accent \`${e.accent || e.highlight || e.HighlightColor}\`${e.emotion ? ` · emotion \`${e.emotion}\`` : ""}`,
          )
          .join("\n")
      : "_No history entries selected or available._";

  const t = s.wcag?.textOnBg || {};
  const a = s.wcag?.accentOnBg || {};

  return `# ${s.brandName} Brand System — AI Implementation Brief

> Auto-generated from **SeeUI** workspace (localStorage + last user actions).  
> **Updated:** ${s.updatedAtIso}  
> **Emotion:** ${s.emotionLabel} (\`${s.emotion}\`) · **Mode:** ${s.mode}

---

## Purpose for AI agents

Use this document as the **single source of truth** when implementing UI, generating components, writing CSS/Tailwind, or reviewing design consistency. Prefer these tokens over inventing new colors or fonts.

---

${
  sectionOn(selected, "meta")
    ? `## Workspace metadata

| Field | Value |
|-------|-------|
| Brand | ${s.brandName} |
| Source | ${s.sourceLabel} |
| Emotion ID | \`${s.emotion}\` |
| Emotion label | ${s.emotionLabel} |
| Color mode | ${s.mode} (dark=${s.isDark}) |
| Text auto-contrast | ${s.textIsAuto} |
| Type mode | ${s.emotionTypeActive ? "Emotion typography pair" : "Manual board"} |
| Hero weight / size | ${s.fontWeight} / ${s.fontSize}px |
| Last saved | ${s.updatedAtIso} |

---
`
    : ""
}
${
  sectionOn(selected, "palette")
    ? `## Core palette

| Role | HEX | Usage |
|------|-----|--------|
| Background | \`${s.background}\` | Page canvas, app shell, large surfaces |
| Text | \`${s.text}\` | Body, headings, icons, chrome |
| Primary / Accent | \`${s.accent}\` | CTAs, links, focus rings, brand emphasis |

**Rules**
- Do **not** invent alternate brand hues unless the user asks.
- Keep accent reserved for interactive emphasis (buttons, links).
- Body text must remain readable on background (see Accessibility).

---
`
    : ""
}
${
  sectionOn(selected, "scale")
    ? `## Design system scale (Tailwind 50–950)

Base **500** = \`${s.accent}\` · token name: \`${s.colorName}\`

| Stop | HEX |
|------|-----|
${scaleRows}

**Tailwind usage examples**
- \`bg-${s.colorName}-500\` primary button
- \`text-${s.colorName}-700\` links on light surfaces
- \`bg-${s.colorName}-50\` soft chips / banners

---
`
    : ""
}
${
  sectionOn(selected, "typography")
    ? `## Typography

| Role | Font |
|------|------|
| Heading | **${s.typography?.heading?.name || "Inter"}** |
| Body | **${s.typography?.body?.name || "Inter"}** |

Psychology: ${s.typography?.psychology || "Balance hierarchy with readability."}

\`\`\`css
${toGoogleFontsImport(s.typography) || "/* Google Fonts import unavailable */"}

:root {
  --font-heading: ${s.typography?.heading?.family || "system-ui"};
  --font-body: ${s.typography?.body?.family || "system-ui"};
}
h1, h2, h3 { font-family: var(--font-heading); font-weight: ${s.fontWeight}; }
body, p, button { font-family: var(--font-body); }
\`\`\`

---
`
    : ""
}
${
  sectionOn(selected, "accessibility")
    ? `## Accessibility (WCAG)

| Pairing | Ratio | Level | Pass |
|---------|-------|-------|------|
| Text on background | ${t.ratioLabel || "—"} | ${t.level || "—"} | ${t.pass ? "YES" : "NO / check"} |
| Accent on background | ${a.ratioLabel || "—"} | ${a.level || "—"} | ${a.pass ? "YES" : "NO / check"} |

**AI constraints**
- Never place body copy below AA (4.5:1) on background.
- For primary buttons, prefer white (or black) label on accent only if contrast passes.

---
`
    : ""
}
${
  sectionOn(selected, "tokens")
    ? `## CSS tokens (copy-ready)

\`\`\`css
${buildTokensSection(s).replace(/^\/\*\*[\s\S]*?\*\/\n?/, "")}
\`\`\`

---
`
    : ""
}
${
  sectionOn(selected, "tailwind")
    ? `## Tailwind config snippet

\`\`\`js
${buildTailwindSection(s).replace(/^\/\*\*[\s\S]*?\*\/\n?/, "")}
\`\`\`

---
`
    : ""
}
${
  sectionOn(selected, "history")
    ? `## Session history (user's recent work)

${historyMd}

---
`
    : ""
}
## Implementation checklist for AI

1. Apply core palette to layout background / text / primary CTA.
2. Load Google fonts for heading + body; do not substitute without reason.
3. Wire Tailwind or CSS variables from this brief.
4. Verify text-on-background contrast before shipping.
5. Prefer \`${s.colorName}-*\` scale stops over one-off hex values in components.

---

*Generated by SeeUI Emotion-Based Color Psychology Generator · do not invent a conflicting brand system unless the user explicitly requests a redesign.*
`;
}

/**
 * Download helper
 * @param {string} filename
 * @param {string} content
 * @param {string} [mime]
 */
export function downloadTextFile(
  filename,
  content,
  mime = "text/plain;charset=utf-8",
) {
  if (typeof document === "undefined") return false;
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/** High-level format modes for the Export Studio */
export const EXPORT_FORMATS = [
  {
    id: "code",
    label: "Full code bundle",
    extension: "js",
    mime: "text/javascript;charset=utf-8",
    description: "Commented JS modules for engineering",
    build: buildCodeBundle,
  },
  {
    id: "readme",
    label: "README.md (AI)",
    extension: "md",
    mime: "text/markdown;charset=utf-8",
    description: "Implementation brief for AI coding agents",
    build: buildReadmeForAi,
  },
  {
    id: "css",
    label: "CSS tokens only",
    extension: "css",
    mime: "text/css;charset=utf-8",
    description: ":root variables + Google Fonts",
    build: (snap, sel) => {
      // Force tokens section content
      const s = pick(snap);
      return `/* SeeUI CSS tokens · ${s.updatedAtIso} */\n\n${buildTokensSection(s)}`;
    },
  },
  {
    id: "tailwind",
    label: "Tailwind config only",
    extension: "js",
    mime: "text/javascript;charset=utf-8",
    description: "theme.extend ready to paste",
    build: (snap) => buildTailwindSection(pick(snap)),
  },
];
