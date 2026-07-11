/**
 * Unified palette history for all SeeUI features.
 * Shared across home, /extract, /preview, gallery, image picker, emotion board.
 */

export const PALETTE_HISTORY_KEY = "seeui:palette-history";
/** @deprecated use PALETTE_HISTORY_KEY — kept for migration */
export const LEGACY_RECENT_KEY = "seeui:recent-palettes";
export const MAX_HISTORY = 20;
export const HISTORY_EVENT = "seeui:history";

/**
 * @typedef {{
 *   id: string,
 *   background: string,
 *   text: string,
 *   highlight: string,
 *   accent: string,
 *   BackgroundColor: string,
 *   TextColor: string,
 *   HighlightColor: string,
 *   label: string,
 *   emotion: string|null,
 *   source: string,
 *   mode: string|null,
 *   savedAt: number
 * }} HistoryEntry
 */

/**
 * @param {object} palette
 * @param {object} [meta]
 * @returns {HistoryEntry}
 */
export function normalizeHistoryEntry(palette = {}, meta = {}) {
  const background =
    palette.background || palette.BackgroundColor || "#0F172A";
  const text = palette.text || palette.TextColor || "#F8FAFC";
  const highlight =
    palette.accent ||
    palette.highlight ||
    palette.HighlightColor ||
    "#6366F1";

  return {
    id:
      palette.id ||
      `hist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    background,
    text,
    highlight,
    accent: highlight,
    BackgroundColor: background,
    TextColor: text,
    HighlightColor: highlight,
    label: palette.label || meta.label || "Palette",
    emotion: palette.emotion || palette.emotionId || meta.emotion || null,
    source: meta.source || palette.source || "workspace",
    mode: palette.mode || meta.mode || null,
    savedAt: Date.now(),
  };
}

function entryKey(e) {
  return `${e.background}|${e.text}|${e.highlight}|${e.emotion || ""}`;
}

/**
 * Read history from localStorage (migrates legacy key once).
 * @returns {HistoryEntry[]}
 */
export function readHistory() {
  if (typeof window === "undefined") return [];
  try {
    let raw = window.localStorage.getItem(PALETTE_HISTORY_KEY);
    if (!raw) {
      // Migrate old recent-palettes list
      const legacy = window.localStorage.getItem(LEGACY_RECENT_KEY);
      if (legacy) {
        raw = legacy;
        window.localStorage.setItem(PALETTE_HISTORY_KEY, legacy);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {HistoryEntry[]} list
 */
function writeHistoryList(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PALETTE_HISTORY_KEY, JSON.stringify(list));
    // Keep legacy key in sync for older UI
    window.localStorage.setItem(LEGACY_RECENT_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent(HISTORY_EVENT, { detail: list }),
    );
  } catch {
    /* quota */
  }
}

/**
 * Push a palette into history (newest first, deduped, max MAX_HISTORY).
 * @param {object} palette
 * @param {object} [meta]
 * @returns {HistoryEntry|null}
 */
export function pushHistory(palette, meta = {}) {
  if (!palette) return null;
  const entry = normalizeHistoryEntry(palette, meta);
  const key = entryKey(entry);
  const prev = readHistory();
  const next = [entry, ...prev.filter((p) => entryKey(p) !== key)].slice(
    0,
    MAX_HISTORY,
  );
  writeHistoryList(next);
  return entry;
}

/**
 * @param {string} id
 */
export function removeHistory(id) {
  const next = readHistory().filter((p) => p.id !== id);
  writeHistoryList(next);
  return next;
}

export function clearHistory() {
  writeHistoryList([]);
}

/** Human labels for source badges */
export const SOURCE_LABELS = {
  gallery: "Gallery",
  extract: "Image extract",
  "image-picker": "Image picker",
  emotion: "Emotion board",
  studio: "Design studio",
  workspace: "Workspace",
  manual: "Manual",
  recent: "History",
  preview: "Preview",
  gradient: "Gradient",
};
