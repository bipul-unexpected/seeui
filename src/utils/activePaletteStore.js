/**
 * Session store so the Home workspace and /preview page share
 * the active psychology palette + emotion.
 */

export const ACTIVE_PALETTE_KEY = "seeui:active-palette";

const DEFAULT = {
  background: "#0F172A",
  text: "#F8FAFC",
  accent: "#6366F1",
  emotion: "trust",
  label: "Default",
  updatedAt: 0,
};

/**
 * @returns {typeof DEFAULT}
 */
export function readActivePalette() {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(ACTIVE_PALETTE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return {
      background: parsed.background || DEFAULT.background,
      text: parsed.text || DEFAULT.text,
      accent: parsed.accent || parsed.highlight || DEFAULT.accent,
      emotion: parsed.emotion || DEFAULT.emotion,
      label: parsed.label || DEFAULT.label,
      updatedAt: parsed.updatedAt || 0,
    };
  } catch {
    return { ...DEFAULT };
  }
}

/**
 * Normalize for comparison (ignore updatedAt / label).
 */
export function paletteSignature(p = {}) {
  return [
    p.background || "",
    p.text || "",
    p.accent || p.highlight || "",
    p.emotion || "",
  ].join("|");
}

/**
 * @param {object} palette
 * @param {{ silent?: boolean }} [opts] — silent skips CustomEvent (avoids feedback loops)
 * @returns {typeof DEFAULT | null} written payload, or null if unchanged
 */
export function writeActivePalette(palette = {}, opts = {}) {
  if (typeof window === "undefined") return null;
  try {
    const prev = readActivePalette();
    const next = {
      background:
        palette.background || palette.BackgroundColor || DEFAULT.background,
      text: palette.text || palette.TextColor || DEFAULT.text,
      accent:
        palette.accent ||
        palette.highlight ||
        palette.HighlightColor ||
        DEFAULT.accent,
      emotion: palette.emotion || palette.emotionId || DEFAULT.emotion,
      label: palette.label || prev.label || DEFAULT.label,
      updatedAt: Date.now(),
    };

    // Skip write + event when nothing meaningful changed
    if (paletteSignature(prev) === paletteSignature(next)) {
      return null;
    }

    window.localStorage.setItem(ACTIVE_PALETTE_KEY, JSON.stringify(next));

    if (!opts.silent) {
      window.dispatchEvent(
        new CustomEvent("seeui:palette", { detail: next }),
      );
    }
    return next;
  } catch {
    return null;
  }
}
