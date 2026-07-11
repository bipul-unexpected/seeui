/**
 * Apply a palette to the global SeeUI workspace + history.
 * Home page listens for `seeui:palette` and updates the live canvas.
 */

import { writeActivePalette } from "./activePaletteStore";
import { pushHistory } from "./paletteHistoryStore";

/**
 * @param {object} palette — { background, text, accent?, emotion?, label? }
 * @param {object} [meta] — { source, label, emotion, skipHistory?, silent? }
 * @returns {{ background: string, text: string, accent: string, emotion: string|null, label: string }|null}
 */
export function applyToWorkspace(palette, meta = {}) {
  if (!palette?.background && !palette?.BackgroundColor) return null;
  if (!palette?.text && !palette?.TextColor) return null;

  const payload = {
    background: palette.background || palette.BackgroundColor,
    text: palette.text || palette.TextColor,
    accent:
      palette.accent ||
      palette.highlight ||
      palette.HighlightColor ||
      palette.text ||
      palette.TextColor,
    emotion: palette.emotion || palette.emotionId || meta.emotion || null,
    label: palette.label || meta.label || "Applied",
  };

  // Broadcast so home (and other tabs) update live canvas
  writeActivePalette(payload, { silent: meta.silent === true });

  if (!meta.skipHistory) {
    pushHistory(payload, {
      source: meta.source || "workspace",
      label: payload.label,
      emotion: payload.emotion,
      mode: meta.mode || palette.mode || null,
    });
  }

  return payload;
}

/**
 * Save preview/history without forcing a full workspace broadcast.
 * Use when user generates a preview they might apply later.
 */
export function savePreviewToHistory(palette, meta = {}) {
  if (!palette) return null;
  return pushHistory(palette, {
    source: meta.source || "preview",
    label: meta.label || palette.label || "Preview",
    emotion: meta.emotion || palette.emotion,
    mode: meta.mode || palette.mode,
  });
}
