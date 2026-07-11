/**
 * Clear every SeeUI-related localStorage key (user "delete all" action).
 */

import { WORKSPACE_SNAPSHOT_KEY } from "./workspaceSnapshotStore";
import { ACTIVE_PALETTE_KEY } from "./activePaletteStore";
import {
  PALETTE_HISTORY_KEY,
  LEGACY_RECENT_KEY,
} from "./paletteHistoryStore";
import { CUSTOM_FONTS_KEY } from "./customFontsStore";

export const SEEUI_STORAGE_PREFIX = "seeui:";

/** Known keys (prefix sweep still catches future keys). */
export const SEEUI_KNOWN_KEYS = [
  WORKSPACE_SNAPSHOT_KEY,
  ACTIVE_PALETTE_KEY,
  PALETTE_HISTORY_KEY,
  LEGACY_RECENT_KEY,
  CUSTOM_FONTS_KEY,
  "seeui:logo",
  "seeui:recent-palettes",
  "seeui:workspace-snapshot",
  "seeui:active-palette",
  "seeui:palette-history",
  "seeui:custom-fonts",
];

/**
 * Remove all SeeUI localStorage data.
 * @returns {{ removed: string[] }}
 */
export function clearAllSeeUIStorage() {
  if (typeof window === "undefined") return { removed: [] };
  const removed = [];
  try {
    const toRemove = new Set(SEEUI_KNOWN_KEYS);

    // Sweep any key starting with seeui:
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith(SEEUI_STORAGE_PREFIX) || k.startsWith("seeui"))) {
        toRemove.add(k);
      }
    }

    toRemove.forEach((k) => {
      if (window.localStorage.getItem(k) != null) {
        window.localStorage.removeItem(k);
        removed.push(k);
      }
    });

    window.dispatchEvent(
      new CustomEvent("seeui:storage-cleared", { detail: { removed } }),
    );
  } catch (err) {
    console.warn("clearAllSeeUIStorage failed", err);
  }
  return { removed };
}
