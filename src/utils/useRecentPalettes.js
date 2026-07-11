/**
 * React hook for unified palette history (localStorage + live sync).
 */

import { useCallback, useEffect, useState } from "react";
import {
  HISTORY_EVENT,
  MAX_HISTORY,
  PALETTE_HISTORY_KEY,
  clearHistory as clearStore,
  normalizeHistoryEntry,
  pushHistory as pushStore,
  readHistory,
  removeHistory as removeStore,
} from "./paletteHistoryStore";

export const RECENT_PALETTES_KEY = PALETTE_HISTORY_KEY;
export const MAX_RECENT_PALETTES = MAX_HISTORY;

export { normalizeHistoryEntry as normalizePaletteEntry };

/**
 * @returns {{
 *   recent: ReturnType<typeof normalizeHistoryEntry>[],
 *   pushRecent: (palette: object, meta?: object) => void,
 *   clearRecent: () => void,
 *   removeRecent: (id: string) => void
 * }}
 */
export function useRecentPalettes() {
  const [recent, setRecent] = useState(() => readHistory());

  // Live sync across components / tabs
  useEffect(() => {
    const refresh = () => setRecent(readHistory());
    const onHistory = (e) => {
      if (Array.isArray(e?.detail)) setRecent(e.detail);
      else refresh();
    };
    const onStorage = (e) => {
      if (
        e.key === PALETTE_HISTORY_KEY ||
        e.key === "seeui:recent-palettes"
      ) {
        refresh();
      }
    };
    window.addEventListener(HISTORY_EVENT, onHistory);
    window.addEventListener("storage", onStorage);
    // Re-read on mount (other pages may have written)
    refresh();
    return () => {
      window.removeEventListener(HISTORY_EVENT, onHistory);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const pushRecent = useCallback((palette, meta) => {
    const entry = pushStore(palette, meta);
    setRecent(readHistory());
    return entry;
  }, []);

  const clearRecent = useCallback(() => {
    clearStore();
    setRecent([]);
  }, []);

  const removeRecent = useCallback((id) => {
    removeStore(id);
    setRecent(readHistory());
  }, []);

  return {
    recent: Array.isArray(recent) ? recent : [],
    pushRecent,
    clearRecent,
    removeRecent,
  };
}

export default useRecentPalettes;
