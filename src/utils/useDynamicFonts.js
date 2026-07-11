/**
 * Dynamically inject Google Fonts for emotion typography pairs.
 * Uses a module-level singleton so multiple components never fight over <link> tags.
 */

import { useEffect, useMemo } from "react";
import {
  buildDynamicGoogleFontsUrl,
  getTypographyForEmotion,
} from "../data/emotionTypography";

const LINK_ATTR = "data-seeui-dynamic-fonts";
const PRECONNECT_ATTR = "data-seeui-font-preconnect";

/** @type {string|null} */
let activeHref = null;
/** @type {number} */
let loadGeneration = 0;

function ensurePreconnects() {
  if (typeof document === "undefined") return;
  [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ].forEach((href, i) => {
    if (document.head.querySelector(`link[${PRECONNECT_ATTR}="${i}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    if (href.includes("gstatic")) link.crossOrigin = "anonymous";
    link.setAttribute(PRECONNECT_ATTR, String(i));
    document.head.appendChild(link);
  });
}

/**
 * Ensure a stylesheet for `href` is in <head>. Idempotent.
 * @param {string|null} href
 * @param {string} [tag]
 */
export function ensureGoogleFontsStylesheet(href, tag = "pair") {
  if (!href || typeof document === "undefined") return;

  // Already loaded
  const existing = document.head.querySelector(`link[${LINK_ATTR}]`);
  if (existing && activeHref === href) return;

  ensurePreconnects();
  loadGeneration += 1;
  const gen = loadGeneration;
  activeHref = href;

  // Remove previous dynamic font stylesheets only
  document.head.querySelectorAll(`link[${LINK_ATTR}]`).forEach((el) => el.remove());

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute(LINK_ATTR, tag);
  // Help browser prioritize text rendering
  link.media = "all";
  document.head.appendChild(link);

  // Safety: if a newer load started, drop this one
  link.onload = () => {
    if (gen !== loadGeneration && link.parentNode) {
      link.remove();
    }
  };
}

/**
 * @param {string|null|undefined} emotionId
 * @param {{ enabled?: boolean }} [opts]
 * @returns {import('../data/emotionTypography').EmotionTypePair}
 */
export function useDynamicFonts(emotionId, opts = {}) {
  const { enabled = true } = opts;

  const pair = useMemo(
    () => getTypographyForEmotion(emotionId),
    [emotionId],
  );

  const href = useMemo(
    () => buildDynamicGoogleFontsUrl([pair.heading, pair.body]),
    [pair],
  );

  useEffect(() => {
    if (!enabled || !href) return;
    ensureGoogleFontsStylesheet(href, pair.id || "pair");
    // Do NOT remove on cleanup — other components may still need the fonts.
    // Singleton replaces the sheet when emotion changes.
  }, [href, enabled, pair.id]);

  return pair;
}

/**
 * Load an arbitrary list of font google keys.
 * @param {{ google: string }[]} fonts
 */
export function useDynamicFontList(fonts, enabled = true) {
  const href = useMemo(
    () => buildDynamicGoogleFontsUrl(fonts || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(fonts || []).map((f) => f?.google).join("|")],
  );

  useEffect(() => {
    if (!enabled || !href) return;
    ensureGoogleFontsStylesheet(href, "list");
  }, [href, enabled]);
}

export default useDynamicFonts;
