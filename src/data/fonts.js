// Curated list of popular Google Fonts.
// `family` is the literal CSS font-family value for inline styles — this is
// what makes typography reliably switch (Tailwind purges dynamic class names).

const FONTS = [
  // ── Sans-serif ─────────────────────────────────────────────────────────────
  {
    name: "Inter",
    slug: "inter",
    family: "'Inter'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Roboto",
    slug: "roboto",
    family: "'Roboto'",
    category: "sans",
    weights: [300, 400, 500, 700, 900],
  },
  {
    name: "Open Sans",
    slug: "open-sans",
    family: "'Open Sans'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800],
  },
  {
    name: "Poppins",
    slug: "poppins",
    family: "'Poppins'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Montserrat",
    slug: "montserrat",
    family: "'Montserrat'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Lato",
    slug: "lato",
    family: "'Lato'",
    category: "sans",
    weights: [300, 400, 700, 900],
  },
  {
    name: "Nunito",
    slug: "nunito",
    family: "'Nunito'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "DM Sans",
    slug: "dm-sans",
    family: "'DM Sans'",
    category: "sans",
    weights: [400, 500, 700],
  },
  {
    name: "Work Sans",
    slug: "work-sans",
    family: "'Work Sans'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Space Grotesk",
    slug: "space-grotesk",
    family: "'Space Grotesk'",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
  },
  {
    name: "Manrope",
    slug: "manrope",
    family: "'Manrope'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800],
  },
  {
    name: "Plus Jakarta Sans",
    slug: "plus-jakarta-sans",
    family: "'Plus Jakarta Sans'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800],
  },
  {
    name: "Outfit",
    slug: "outfit",
    family: "'Outfit'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Figtree",
    slug: "figtree",
    family: "'Figtree'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Sora",
    slug: "sora",
    family: "'Sora'",
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800],
  },

  // ── Serif ──────────────────────────────────────────────────────────────────
  {
    name: "Playfair Display",
    slug: "playfair-display",
    family: "'Playfair Display'",
    category: "serif",
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    name: "Merriweather",
    slug: "merriweather",
    family: "'Merriweather'",
    category: "serif",
    weights: [300, 400, 700, 900],
  },
  {
    name: "Lora",
    slug: "lora",
    family: "'Lora'",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    name: "EB Garamond",
    slug: "eb-garamond",
    family: "'EB Garamond'",
    category: "serif",
    weights: [400, 500, 600, 700, 800],
  },
  {
    name: "Crimson Text",
    slug: "crimson-text",
    family: "'Crimson Text'",
    category: "serif",
    weights: [400, 600, 700],
  },
  {
    name: "Cormorant Garamond",
    slug: "cormorant-garamond",
    family: "'Cormorant Garamond'",
    category: "serif",
    weights: [300, 400, 500, 600, 700],
  },
  {
    name: "Libre Baskerville",
    slug: "libre-baskerville",
    family: "'Libre Baskerville'",
    category: "serif",
    weights: [400, 700],
  },
  {
    name: "DM Serif Display",
    slug: "dm-serif-display",
    family: "'DM Serif Display'",
    category: "serif",
    weights: [400],
  },
  {
    name: "Source Serif Pro",
    slug: "source-serif-pro",
    family: "'Source Serif Pro'",
    category: "serif",
    weights: [300, 400, 600, 700, 900],
  },
  {
    name: "Fraunces",
    slug: "fraunces",
    family: "'Fraunces'",
    category: "serif",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },

  // ── Display / Heading ──────────────────────────────────────────────────────
  {
    name: "Bebas Neue",
    slug: "bebas-neue",
    family: "'Bebas Neue'",
    category: "display",
    weights: [400],
  },
  {
    name: "Anton",
    slug: "anton",
    family: "'Anton'",
    category: "display",
    weights: [400],
  },
  {
    name: "Oswald",
    slug: "oswald",
    family: "'Oswald'",
    category: "display",
    weights: [300, 400, 500, 600, 700],
  },
  {
    name: "Archivo Black",
    slug: "archivo-black",
    family: "'Archivo Black'",
    category: "display",
    weights: [400],
  },
  {
    name: "Abril Fatface",
    slug: "abril-fatface",
    family: "'Abril Fatface'",
    category: "display",
    weights: [400],
  },

  // ── Monospace ──────────────────────────────────────────────────────────────
  {
    name: "JetBrains Mono",
    slug: "jetbrains-mono",
    family: "'JetBrains Mono'",
    category: "mono",
    weights: [400, 500, 600, 700, 800],
  },
  {
    name: "Fira Code",
    slug: "fira-code",
    family: "'Fira Code'",
    category: "mono",
    weights: [300, 400, 500, 600, 700],
  },
  {
    name: "Space Mono",
    slug: "space-mono",
    family: "'Space Mono'",
    category: "mono",
    weights: [400, 700],
  },
  {
    name: "IBM Plex Mono",
    slug: "ibm-plex-mono",
    family: "'IBM Plex Mono'",
    category: "mono",
    weights: [300, 400, 500, 600, 700],
  },

  // ── Handwritten / Script ───────────────────────────────────────────────────
  {
    name: "Caveat",
    slug: "caveat",
    family: "'Caveat'",
    category: "script",
    weights: [400, 500, 600, 700],
  },
  {
    name: "Dancing Script",
    slug: "dancing-script",
    family: "'Dancing Script'",
    category: "script",
    weights: [400, 500, 600, 700],
  },
  {
    name: "Pacifico",
    slug: "pacifico",
    family: "'Pacifico'",
    category: "script",
    weights: [400],
  },
  {
    name: "Satisfy",
    slug: "satisfy",
    family: "'Satisfy'",
    category: "script",
    weights: [400],
  },
  {
    name: "Great Vibes",
    slug: "great-vibes",
    family: "'Great Vibes'",
    category: "script",
    weights: [400],
  },

  // ── Pixel / Quirky ─────────────────────────────────────────────────────────
  {
    name: "Press Start 2P",
    slug: "press-start-2p",
    family: "'Press Start 2P'",
    category: "quirky",
    weights: [400],
  },
  {
    name: "VT323",
    slug: "vt323",
    family: "'VT323'",
    category: "quirky",
    weights: [400],
  },
  {
    name: "Major Mono Display",
    slug: "major-mono-display",
    family: "'Major Mono Display'",
    category: "quirky",
    weights: [400],
  },
];

export const FONT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "mono", label: "Mono" },
  { id: "script", label: "Script" },
  { id: "quirky", label: "Quirky" },
];

export const WEIGHT_LABELS = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extrabold",
  900: "Black",
};

// Build a single Google Fonts CSS2 URL covering every font + every weight.
// Inject this once via <link> so all families are guaranteed available.
export function buildGoogleFontsUrl() {
  const families = FONTS.map((f) => {
    const name = f.name.replace(/ /g, "+");
    const weights = f.weights.join(";");
    return `family=${name}:wght@${weights}`;
  }).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// Curated palette of pleasant default backgrounds — pick one at random on each load.
export const RANDOM_DEFAULTS = [
  "#5B7FD4",
  "#FF6B9D",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#1E293B",
  "#F472B6",
  "#FBBF24",
  "#22D3EE",
  "#A78BFA",
  "#FB923C",
  "#0F172A",
  "#F8FAFC",
  "#FCA5A5",
  "#34D399",
  "#6366F1",
  "#0EA5E9",
  "#E11D48",
];

export const DEFAULT_FONT = FONTS[0]; // Inter

export default FONTS;
