/**
 * WCAG 2.x contrast utilities — relative luminance + ratio + AA/AAA levels.
 */

/** @param {string} hex */
export function normalizeHex(hex) {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return `#${clean.toUpperCase()}`;
}

/** sRGB channel 0–1 → linear light */
function toLinear(channel) {
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * Relative luminance (0–1) per WCAG 2.1.
 * @param {string} hex
 * @returns {number}
 */
export function getRelativeLuminance(hex) {
  const n = normalizeHex(hex);
  if (!n) return 0;
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Contrast ratio between two colors (1–21).
 * @param {string} foreground
 * @param {string} background
 * @returns {number}
 */
export function getContrastRatio(foreground, background) {
  const L1 = getRelativeLuminance(foreground);
  const L2 = getRelativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * @param {number} ratio
 * @returns {{
 *   ratio: number,
 *   ratioLabel: string,
 *   level: 'AAA'|'AA'|'AA Large'|'Fail',
 *   pass: boolean,
 *   passAA: boolean,
 *   passAAA: boolean,
 *   color: string,
 *   label: string
 * }}
 */
export function evaluateWcag(ratio) {
  const r = Number.isFinite(ratio) ? ratio : 1;
  const passAAA = r >= 7;
  const passAA = r >= 4.5;
  const passAALarge = r >= 3;

  let level = "Fail";
  if (passAAA) level = "AAA";
  else if (passAA) level = "AA";
  else if (passAALarge) level = "AA Large";

  const pass = passAA; // normal text standard
  const color =
    level === "AAA"
      ? "#22C55E"
      : level === "AA"
        ? "#3B82F6"
        : level === "AA Large"
          ? "#F59E0B"
          : "#EF4444";

  const label = pass
    ? `Pass (${level})`
    : level === "AA Large"
      ? "AA Large only"
      : "Fail";

  return {
    ratio: r,
    ratioLabel: `${r.toFixed(1)}:1`,
    level,
    pass,
    passAA,
    passAAA,
    color,
    label,
  };
}

/**
 * Full report for a bg/text pair.
 * @param {string} textColor
 * @param {string} backgroundColor
 */
export function getWcagReport(textColor, backgroundColor) {
  const ratio = getContrastRatio(textColor, backgroundColor);
  return evaluateWcag(ratio);
}
