/**
 * Calculates the relative luminance of a hex color using the WCAG formula
 * and returns an appropriate contrasting text color.
 *
 * @param {string} hex - A hex color string like "#FFFFFF" or "#fff"
 * @returns {string} - "#0A0A0A" for light backgrounds, "#FFFFFF" for dark backgrounds
 */
export function getContrastColor(hex) {
  if (!hex || typeof hex !== "string") {
    return "#0A0A0A";
  }

  // Normalize hex string
  let clean = hex.replace("#", "").trim();

  // Expand 3-digit shorthand (e.g. "fff" -> "ffffff")
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (clean.length !== 6) {
    return "#0A0A0A";
  }

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  // Apply sRGB gamma correction
  const toLinear = (channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // WCAG relative luminance formula
  const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

  // Threshold of 0.5 works well in practice; lower values bias toward dark text
  return luminance > 0.5 ? "#0A0A0A" : "#FFFFFF";
}

/**
 * Returns a muted/secondary text color appropriate for the given background.
 *
 * @param {string} hex - A hex color string
 * @returns {string} - A semi-transparent contrasting color
 */
export function getMutedContrastColor(hex) {
  const base = getContrastColor(hex);
  // 70% opacity version of the contrast color
  return base === "#FFFFFF"
    ? "rgba(255, 255, 255, 0.7)"
    : "rgba(10, 10, 10, 0.65)";
}
