/**
 * Shared theme helpers for Advanced UI previews + Preview Studio.
 */

import {
  getRadiusPx,
  getShadowCss,
  DENSITY_OPTIONS,
} from "../../data/themeTemplates";

/**
 * @param {object} p
 */
export function buildPreviewTheme({
  background,
  text,
  highlight,
  headingFont = "system-ui, sans-serif",
  bodyFont = "system-ui, sans-serif",
  radius = "lg",
  density = "comfortable",
  shadow = "soft",
}) {
  const isDarkBg = (() => {
    const h = (background || "#000").replace("#", "");
    if (h.length < 6) return true;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55;
  })();

  const densityMeta =
    DENSITY_OPTIONS.find((d) => d.id === density) || DENSITY_OPTIONS[1];

  return {
    background,
    text,
    highlight,
    headingFont,
    bodyFont,
    isDarkBg,
    radius,
    radiusPx: getRadiusPx(radius),
    density,
    densityScale: densityMeta.scale,
    densityPad: densityMeta.pad,
    shadow,
    shadowCss: getShadowCss(shadow, highlight),
    surface: isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    surfaceStrong: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    border: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    muted: isDarkBg ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
    inputBg: isDarkBg ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.92)",
  };
}

export const PREVIEW_TRANSITION = "transition-all duration-300 ease-in-out";
