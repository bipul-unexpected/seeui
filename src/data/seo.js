/**
 * SeeUI SEO configuration — titles, descriptions, keywords, structured data.
 * Used by root meta, page-level meta, JSON-LD, sitemap, and robots.
 */

import {
  CREATOR_NAME,
  CREATOR_SITE_URL,
  GITHUB_REPO_URL,
  SITE_LIVE_URL,
  X_HANDLE,
  X_PROFILE_URL,
} from "./branding";

export const SITE_URL = SITE_LIVE_URL;
export const SITE_NAME = "SeeUI";
export const SITE_TAGLINE = "Emotion-Based Color Psychology Generator";
export const SITE_DEFAULT_TITLE =
  "SeeUI | Emotion Color Psychology Generator, WCAG Contrast Checker & Tailwind Palette Tool";
export const SITE_DEFAULT_DESCRIPTION =
  "SeeUI is a free online emotion-based color psychology generator for designers and developers. Build Background, Text, and Accent palettes, check WCAG AA/AAA contrast, pair Google Fonts, export Tailwind 50–950 scales, generate brand books as PDF, extract emotions from images, and craft pro gradients — all in a live UI workspace.";

export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_ALT =
  "SeeUI emotion-based color psychology generator with live palette, WCAG badge, and brand style guide PDF export";

/** Comprehensive keyword set for discovery (meta keywords + content strategy) */
export const SITE_KEYWORDS = [
  // Brand
  "SeeUI",
  "see UI",
  "seeui",
  "seeui.bipul.tech",
  "SeeUI color tool",
  "SeeUI palette generator",

  // Core product
  "emotion based color psychology generator",
  "color psychology generator",
  "emotion color palette generator",
  "psychology color palette",
  "emotion based design tool",
  "color emotion mapping",
  "brand emotion palette",

  // Color tools
  "UI color tester",
  "live UI color tester",
  "website color scheme tester",
  "color palette generator online free",
  "brand color palette generator",
  "background and text color tester",
  "hex color picker for websites",
  "RGB HSL CMYK color converter",
  "color scale generator 50 to 950",
  "Tailwind color scale generator",
  "Tailwind CSS palette generator",
  "design system color scale",
  "primary color scale generator",

  // Accessibility
  "WCAG contrast checker",
  "WCAG AA AAA contrast tool",
  "text contrast checker online",
  "accessible color palette generator",
  "color accessibility checker",
  "contrast ratio calculator",
  "fix bad website contrast online",
  "check if text is readable on background",

  // Typography
  "typography preview tool",
  "Google Fonts preview with colors",
  "emotion based typography pairing",
  "font pairing tool for brands",
  "heading and body font tester",
  "web font playground",
  "CSS typography playground",

  // Logo & image
  "logo color matcher",
  "extract colors from logo",
  "image color picker online",
  "image to color palette",
  "image emotion extractor",
  "photo to palette generator",
  "extract brand colors from image",

  // Export & workflow
  "export Tailwind config colors",
  "CSS variables color export",
  "brand style guide PDF generator",
  "brand book PDF free",
  "design tokens export",
  "AI README brand system export",

  // Gradients
  "CSS gradient generator",
  "pro gradient builder",
  "mesh gradient generator",
  "linear radial conic gradient tool",
  "animated CSS gradient",
  "emotion gradient generator",

  // Developer intent
  "front-end UI design tool",
  "developer color picking tool",
  "zero-code UI tester",
  "live CSS color preview",
  "real-time CSS color changer",
  "web design visualizer",
  "fast UI prototyping tool",
  "React UI color playground",

  // Problem phrases (long-tail)
  "how to test website background colors",
  "how to choose text color for background",
  "best colors for trust calm energy brands",
  "generate color palette from emotion",
  "create brand guidelines from colors",
  "preview fonts and colors together",
  "match background color to logo online",
  "test website color combinations free",
  "generate Tailwind theme from palette",
  "download brand style guide PDF free",

  // Related emotions (content relevance)
  "trust blue color palette",
  "calm serenity color scheme",
  "energy brand colors",
  "luxury purple color palette",
  "growth green UI colors",
  "joy optimistic yellow palette",
].join(", ");

/**
 * Per-route SEO definitions
 * @type {Record<string, { path: string, title: string, description: string, keywords: string }>}
 */
export const PAGE_SEO = {
  home: {
    path: "/",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    keywords: SITE_KEYWORDS,
  },
  preview: {
    path: "/preview",
    title:
      "Emotion Design Studio | Live UI Templates with Your Palette — SeeUI",
    description:
      "Preview your emotion palette on premium UI templates: heroes, dashboards, product cards, and login forms. Customize tokens, density, and shadows — then apply to your SeeUI workspace.",
    keywords: [
      "UI design studio free",
      "live UI template preview",
      "color palette on real UI",
      "dashboard color mockup",
      "hero section color tester",
      "product card palette preview",
      "login form color contrast",
      "design tokens live preview",
      "SeeUI design studio",
    ].join(", "),
  },
  extract: {
    path: "/extract",
    title:
      "Image Emotion Extractor | Photo to Palette & Color Psychology — SeeUI",
    description:
      "Upload any photo or logo to extract dominant colors, map HSL psychology to emotions, generate a Background/Text/Accent palette, and apply it to your live SeeUI workspace free.",
    keywords: [
      "image to color palette",
      "extract colors from photo",
      "logo color extractor",
      "image emotion analysis",
      "photo color psychology",
      "dominant color picker from image",
      "brand colors from photograph",
      "SeeUI image emotion extractor",
    ].join(", "),
  },
  gradient: {
    path: "/gradient",
    title:
      "Pro Gradient Builder | Linear Radial Conic Mesh + Animation — SeeUI",
    description:
      "Build emotion-based CSS gradients: linear, radial, conic, and mesh. Animate flow for product heroes, export CSS snippets, and sync with your SeeUI palette free.",
    keywords: [
      "CSS gradient generator free",
      "mesh gradient maker",
      "animated gradient CSS",
      "conic gradient tool",
      "radial gradient builder",
      "emotion based gradients",
      "hero section gradient generator",
      "SeeUI gradient builder",
    ].join(", "),
  },
};

/**
 * Build React Router / framework meta array for a page key.
 * @param {keyof typeof PAGE_SEO} pageKey
 * @param {{ absolute?: boolean }} [opts]
 */
export function buildPageMeta(pageKey = "home", opts = {}) {
  const page = PAGE_SEO[pageKey] || PAGE_SEO.home;
  const url = `${SITE_URL}${page.path === "/" ? "" : page.path}`;
  const title = page.title;
  const description = page.description;
  const keywords = page.keywords || SITE_KEYWORDS;

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: `${CREATOR_NAME} · ${SITE_NAME}` },
    { name: "creator", content: CREATOR_NAME },
    { name: "publisher", content: SITE_NAME },
    {
      name: "robots",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    {
      name: "googlebot",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { name: "bingbot", content: "index, follow" },
    { name: "theme-color", content: "#0F172A" },
    { name: "color-scheme", content: "dark light" },
    { name: "application-name", content: SITE_NAME },
    { name: "apple-mobile-web-app-title", content: SITE_NAME },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "format-detection", content: "telephone=no" },
    { name: "referrer", content: "origin-when-cross-origin" },
    // Geo / language hints
    { name: "language", content: "English" },
    { httpEquiv: "content-language", content: "en" },
    // Classification
    { name: "category", content: "Design, Developer Tools, Productivity" },
    { name: "classification", content: "Design Tool" },
    {
      name: "subject",
      content:
        "Color psychology, UI design, WCAG contrast, Tailwind palettes, brand systems",
    },
    {
      name: "abstract",
      content: description,
    },
    {
      name: "summary",
      content: description,
    },
    {
      name: "rating",
      content: "General",
    },
    {
      name: "revisit-after",
      content: "7 days",
    },
    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:secure_url", content: OG_IMAGE },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
    { name: "twitter:site", content: X_HANDLE },
    { name: "twitter:creator", content: X_HANDLE },
  ];
}

/**
 * Canonical + common link tags for a page.
 * @param {keyof typeof PAGE_SEO} pageKey
 */
export function buildPageLinks(pageKey = "home") {
  const page = PAGE_SEO[pageKey] || PAGE_SEO.home;
  const url = `${SITE_URL}${page.path === "/" ? "" : page.path}`;
  return [
    { rel: "canonical", href: url },
    { rel: "alternate", hrefLang: "en", href: url },
    { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
  ];
}

/**
 * JSON-LD graph for rich results (WebApplication + WebSite + SoftwareApplication + FAQ).
 */
export function buildJsonLdGraph() {
  const app = {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: SITE_NAME,
    alternateName: ["See UI", "seeui", "SeeUI Color Psychology"],
    url: SITE_URL,
    description: SITE_DEFAULT_DESCRIPTION,
    applicationCategory: ["DesignApplication", "DeveloperApplication"],
    applicationSubCategory: "Color Psychology & Design System Tool",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Modern browser recommended.",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Emotion-based color psychology generator",
      "Live UI color tester for background, text, and accent",
      "WCAG 2.1 AA/AAA contrast checker",
      "Psychology color palette gallery",
      "Tailwind CSS 50–950 color scale generator",
      "Emotion typography pairing with Google Fonts",
      "Custom font upload",
      "Brand style guide multi-page PDF export",
      "Export Tailwind config, CSS variables, and AI README",
      "Image emotion extractor from photos and logos",
      "Pro gradient builder with animation",
      "HEX, RGB, HSL, HSV, CMYK formats",
      "Local workspace history and logo persistence",
      "Emotion Design Studio with live UI templates",
    ],
    screenshot: OG_IMAGE,
    image: OG_IMAGE,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
    creator: {
      "@type": "Person",
      name: CREATOR_NAME,
      url: CREATOR_SITE_URL,
      sameAs: [GITHUB_REPO_URL, X_PROFILE_URL],
    },
    author: {
      "@type": "Person",
      name: CREATOR_NAME,
      url: CREATOR_SITE_URL,
      sameAs: [GITHUB_REPO_URL, X_PROFILE_URL],
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DEFAULT_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    sameAs: [GITHUB_REPO_URL, X_PROFILE_URL, CREATOR_SITE_URL],
    description: SITE_TAGLINE,
    founder: {
      "@type": "Person",
      name: CREATOR_NAME,
      url: CREATOR_SITE_URL,
      sameAs: [GITHUB_REPO_URL, X_PROFILE_URL],
    },
  };

  const software = {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: SITE_URL,
    description: SITE_DEFAULT_DESCRIPTION,
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What is SeeUI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SeeUI is a free online tool that generates emotion-based color psychology palettes, checks WCAG contrast, pairs typography, exports Tailwind design systems, and creates multi-page brand style guide PDFs for designers and developers.",
        },
      },
      {
        "@type": "Question",
        name: "Is SeeUI free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. SeeUI is free to use in the browser with no account required for core palette, contrast, typography, export, extract, gradient, and brand book features.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export a Tailwind color scale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. SeeUI generates a full Tailwind 50–950 scale from your primary emotion color and can export Tailwind config snippets, CSS variables, hex arrays, and AI-ready README docs.",
        },
      },
      {
        "@type": "Question",
        name: "Does SeeUI check WCAG accessibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SeeUI calculates WCAG 2.1 contrast ratios for text on background and related pairings, showing AA/AAA pass or fail badges live as you change colors.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate a brand style guide PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Download a multi-page A4 Brand Book PDF that includes your logo (if uploaded), color system with HEX/RGB/CMYK, WCAG scores, typography hierarchy, and UI application mockups from your last workspace state.",
        },
      },
    ],
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Design Studio",
        item: `${SITE_URL}/preview`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Image Emotion Extractor",
        item: `${SITE_URL}/extract`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Gradient Builder",
        item: `${SITE_URL}/gradient`,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [org, website, app, software, faq, breadcrumbs],
  };
}

/** Sitemap routes for crawlers */
export const SITEMAP_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/preview", priority: "0.9", changefreq: "weekly" },
  { path: "/extract", priority: "0.9", changefreq: "weekly" },
  { path: "/gradient", priority: "0.9", changefreq: "weekly" },
];
