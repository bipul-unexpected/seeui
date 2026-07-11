/**
 * Custom uploaded typography — persisted in localStorage + FontFace registry.
 */

export const CUSTOM_FONTS_KEY = "seeui:custom-fonts";
export const MAX_CUSTOM_FONTS = 12;
export const MAX_FONT_BYTES = 2.5 * 1024 * 1024; // 2.5MB

/** @typedef {{
 *   name: string,
 *   slug: string,
 *   family: string,
 *   category: 'custom',
 *   weights: number[],
 *   dataUrl: string,
 *   format: string,
 *   fileName: string,
 *   savedAt: number,
 *   custom: true
 * }} CustomFont */

/**
 * @returns {CustomFont[]}
 */
export function readCustomFonts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_FONTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((f) => f?.slug && f?.dataUrl) : [];
  } catch {
    return [];
  }
}

/**
 * @param {CustomFont[]} list
 */
export function writeCustomFonts(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CUSTOM_FONTS_KEY,
      JSON.stringify(list.slice(0, MAX_CUSTOM_FONTS)),
    );
  } catch (err) {
    console.warn("custom fonts save failed", err);
  }
}

/**
 * @param {string} name
 */
export function slugifyFontName(name) {
  return (
    "custom-" +
    String(name || "font")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40)
  );
}

/**
 * Register a font with the browser FontFace API.
 * @param {CustomFont} font
 */
export async function registerFontFace(font) {
  if (typeof document === "undefined" || !font?.dataUrl || !font?.name) return false;
  try {
    // Skip if already loaded under this family
    const existing = [...document.fonts].some(
      (f) => f.family.replace(/['"]/g, "") === font.name.replace(/['"]/g, ""),
    );
    if (existing) return true;

    const face = new FontFace(font.name, `url(${font.dataUrl})`, {
      style: "normal",
      weight: "100 900",
      display: "swap",
    });
    const loaded = await face.load();
    document.fonts.add(loaded);
    return true;
  } catch (err) {
    console.warn("FontFace load failed", font.name, err);
    return false;
  }
}

/**
 * Re-register all saved custom fonts (call on app mount).
 */
export async function registerAllCustomFonts(list) {
  const fonts = list || readCustomFonts();
  await Promise.all(fonts.map((f) => registerFontFace(f)));
  return fonts;
}

/**
 * Read a File into a CustomFont record.
 * @param {File} file
 * @returns {Promise<CustomFont>}
 */
export function fileToCustomFont(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file"));
      return;
    }
    if (file.size > MAX_FONT_BYTES) {
      reject(new Error("Font file too large (max 2.5MB)"));
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowed = ["ttf", "otf", "woff", "woff2"];
    if (!allowed.includes(ext)) {
      reject(new Error("Use .ttf, .otf, .woff, or .woff2"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read font file"));
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const baseName = file.name.replace(/\.[^.]+$/, "").trim() || "Custom Font";
      const slug = slugifyFontName(baseName + "-" + Date.now().toString(36));
      /** @type {CustomFont} */
      const font = {
        name: baseName,
        slug,
        family: `'${baseName.replace(/'/g, "")}', system-ui, sans-serif`,
        category: "custom",
        weights: [400, 500, 600, 700],
        dataUrl,
        format: ext,
        fileName: file.name,
        savedAt: Date.now(),
        custom: true,
      };
      resolve(font);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Add font to storage (dedupe by name).
 * @param {CustomFont} font
 * @returns {CustomFont[]}
 */
export function addCustomFont(font) {
  const prev = readCustomFonts();
  const next = [font, ...prev.filter((f) => f.slug !== font.slug)].slice(
    0,
    MAX_CUSTOM_FONTS,
  );
  writeCustomFonts(next);
  return next;
}

/**
 * @param {string} slug
 * @returns {CustomFont[]}
 */
export function removeCustomFont(slug) {
  const next = readCustomFonts().filter((f) => f.slug !== slug);
  writeCustomFonts(next);
  return next;
}
