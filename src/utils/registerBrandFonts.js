/**
 * Dynamic font registration for @react-pdf/renderer.
 * Loads TTF/WOFF files from jsDelivr Fontsource (print-safe).
 */

import { Font } from "@react-pdf/renderer";

/** Map display names → fontsource package ids */
const FONTSOURCE_IDS = {
  Inter: "inter",
  Roboto: "roboto",
  "Open Sans": "open-sans",
  Montserrat: "montserrat",
  Lato: "lato",
  Poppins: "poppins",
  Nunito: "nunito",
  "DM Sans": "dm-sans",
  "Work Sans": "work-sans",
  "Space Grotesk": "space-grotesk",
  Merriweather: "merriweather",
  "Playfair Display": "playfair-display",
  "Source Serif 4": "source-serif-4",
  "Source Sans 3": "source-sans-3",
  "Libre Baskerville": "libre-baskerville",
  "Cormorant Garamond": "cormorant-garamond",
  Cormorant: "cormorant",
  Karla: "karla",
  Quicksand: "quicksand",
  Fredoka: "fredoka",
  "Nunito Sans": "nunito-sans",
};

const registered = new Set();

/**
 * Build a jsDelivr URL for a Fontsource latin file.
 * Prefer .ttf when available via github google fonts mirror as secondary.
 * @param {string} id fontsource package id
 * @param {number} weight
 */
function fontsourceUrl(id, weight) {
  // Fontsource v5 files path (woff is widely supported by react-pdf)
  return `https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/latin-${weight}-normal.woff`;
}

/**
 * Fallback: Google Fonts GitHub OFL raw TTF (best effort).
 * Many react-pdf demos use Roboto from cdnjs.
 */
const CDNJS_ROBOTO = {
  400: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
  700: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
};

/**
 * Register a single family for PDF use (400 + 700).
 * Safe to call multiple times — deduped.
 * @param {string} familyName e.g. "Inter", "Merriweather"
 * @returns {string} registered family name (or Helvetica fallback key)
 */
export function registerPdfFont(familyName) {
  const name = (familyName || "Inter").replace(/['"]/g, "").split(",")[0].trim();
  if (!name) return "Helvetica";

  const cacheKey = name.toLowerCase();
  if (registered.has(cacheKey)) return name;

  const id = FONTSOURCE_IDS[name];

  try {
    if (id) {
      Font.register({
        family: name,
        fonts: [
          {
            src: fontsourceUrl(id, 400),
            fontWeight: 400,
          },
          {
            src: fontsourceUrl(id, 700),
            fontWeight: 700,
          },
        ],
      });
      registered.add(cacheKey);
      return name;
    }

    // Unknown font → Roboto as professional stand-in under original name
    Font.register({
      family: name,
      fonts: [
        { src: CDNJS_ROBOTO[400], fontWeight: 400 },
        { src: CDNJS_ROBOTO[700], fontWeight: 700 },
      ],
    });
    registered.add(cacheKey);
    return name;
  } catch (err) {
    console.warn("PDF font register failed for", name, err);
    return "Helvetica";
  }
}

/**
 * Register heading + body for a brand book and return family names to use in styles.
 * @param {{ heading?: string|object, body?: string|object }} typography
 */
export function registerBrandBookFonts(typography = {}) {
  const headingName =
    typeof typography.heading === "string"
      ? typography.heading
      : typography.heading?.name || "Inter";
  const bodyName =
    typeof typography.body === "string"
      ? typography.body
      : typography.body?.name || "Inter";

  // Ensure hyphenation callback doesn't crash
  try {
    Font.registerHyphenationCallback((word) => [word]);
  } catch {
    /* already registered */
  }

  const heading = registerPdfFont(headingName);
  const body = registerPdfFont(bodyName);

  return { heading, body };
}

/**
 * Preload fonts before PDFDownloadLink renders (call on mount / emotion change).
 * @returns {Promise<{ heading: string, body: string }>}
 */
export async function prepareBrandBookFonts(typography) {
  const families = registerBrandBookFonts(typography);
  // Give the browser a tick to start fetching; react-pdf fetches on render too
  await new Promise((r) => setTimeout(r, 50));
  return families;
}
