/**
 * Full workspace snapshot — localStorage single source of truth.
 * PDF export + Export Studio always read the latest saved work.
 */

import { readHistory } from "./paletteHistoryStore";
import { getTypographyForEmotion } from "../data/emotionTypography";
import { generateColorScale } from "./colorScaleEngine";
import { getWcagReport } from "./wcagContrast";

export const WORKSPACE_SNAPSHOT_KEY = "seeui:workspace-snapshot";
export const WORKSPACE_SNAPSHOT_EVENT = "seeui:workspace-snapshot";

/** @typedef {object} WorkspaceSnapshot */

/**
 * @returns {WorkspaceSnapshot|null}
 */
export function readWorkspaceSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Build a normalized full snapshot from live UI + history.
 * @param {object} partial
 */
export function buildWorkspaceSnapshot(partial = {}) {
  const background =
    partial.background || partial.BackgroundColor || "#0F172A";
  const text = partial.text || partial.TextColor || "#F8FAFC";
  const accent =
    partial.accent ||
    partial.highlight ||
    partial.HighlightColor ||
    text ||
    "#6366F1";
  const emotion = partial.emotion || partial.emotionId || "trust";
  const typography =
    partial.typography || getTypographyForEmotion(emotion);

  const recent =
    Array.isArray(partial.recent) && partial.recent.length
      ? partial.recent
      : typeof window !== "undefined"
        ? readHistory()
        : [];

  const scale = generateColorScale(accent);
  const wcag = {
    textOnBg: getWcagReport(text, background),
    accentOnBg: getWcagReport(accent, background),
    whiteOnAccent: getWcagReport("#FFFFFF", accent),
  };

  const isDark =
    partial.isDark != null
      ? Boolean(partial.isDark)
      : // simple luminance heuristic
        (() => {
          try {
            const h = background.replace("#", "");
            const full =
              h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
            const r = parseInt(full.slice(0, 2), 16) / 255;
            const g = parseInt(full.slice(2, 4), 16) / 255;
            const b = parseInt(full.slice(4, 6), 16) / 255;
            return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
          } catch {
            return true;
          }
        })();

  return {
    version: 1,
    brandName: partial.brandName || "SeeUI",
    sourceLabel: partial.sourceLabel || "SeeUI Workspace",
    background,
    text,
    accent,
    highlight: accent,
    emotion,
    emotionLabel:
      partial.emotionLabel ||
      typography?.label ||
      String(emotion),
    typography,
    emotionTypeActive:
      partial.emotionTypeActive != null
        ? Boolean(partial.emotionTypeActive)
        : true,
    fontWeight: partial.fontWeight ?? 700,
    fontSize: partial.fontSize ?? 56,
    manualFontName: partial.manualFontName || null,
    fontSlug: partial.fontSlug || null,
    textIsAuto: Boolean(partial.textIsAuto),
    isDark,
    mode: partial.mode || (isDark ? "dark" : "light"),
    logoUrl: partial.logoUrl || null,
    recent: recent.slice(0, 20),
    scale,
    wcag: {
      textOnBg: {
        ratio: wcag.textOnBg.ratio,
        ratioLabel: wcag.textOnBg.ratioLabel,
        level: wcag.textOnBg.level,
        pass: wcag.textOnBg.pass,
        label: wcag.textOnBg.label,
      },
      accentOnBg: {
        ratio: wcag.accentOnBg.ratio,
        ratioLabel: wcag.accentOnBg.ratioLabel,
        level: wcag.accentOnBg.level,
        pass: wcag.accentOnBg.pass,
      },
      whiteOnAccent: {
        ratio: wcag.whiteOnAccent.ratio,
        ratioLabel: wcag.whiteOnAccent.ratioLabel,
        level: wcag.whiteOnAccent.level,
        pass: wcag.whiteOnAccent.pass,
      },
    },
    /** Panel dock open state (optional) */
    panels: partial.panels || null,
    updatedAt: Date.now(),
    updatedAtIso: new Date().toISOString(),
  };
}

/**
 * Persist snapshot. Always writes (user work must stick).
 * @param {object} partial
 * @param {{ silent?: boolean }} [opts]
 */
export function writeWorkspaceSnapshot(partial = {}, opts = {}) {
  if (typeof window === "undefined") return null;
  try {
    const next = buildWorkspaceSnapshot({
      ...readWorkspaceSnapshot(),
      ...partial,
    });
    window.localStorage.setItem(
      WORKSPACE_SNAPSHOT_KEY,
      JSON.stringify(next),
    );
    if (!opts.silent) {
      window.dispatchEvent(
        new CustomEvent(WORKSPACE_SNAPSHOT_EVENT, { detail: next }),
      );
    }
    return next;
  } catch {
    return null;
  }
}

/**
 * Best snapshot for export/PDF: live partial merged with storage + history.
 * @param {object} [live]
 */
export function getLatestWorkspaceSnapshot(live = {}) {
  const stored = readWorkspaceSnapshot() || {};
  return buildWorkspaceSnapshot({
    ...stored,
    ...live,
    // Prefer live recent if provided
    recent:
      Array.isArray(live.recent) && live.recent.length
        ? live.recent
        : stored.recent || readHistory(),
  });
}
