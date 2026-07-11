/**
 * Professional theme templates for the Preview Studio.
 * Each template is a complete emotional design system.
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   tagline: string,
 *   emotion: string,
 *   psychology: string,
 *   mode: 'dark'|'light',
 *   background: string,
 *   text: string,
 *   accent: string,
 *   surface?: string,
 *   muted?: string,
 *   radius: 'sm'|'md'|'lg'|'xl'|'2xl',
 *   density: 'compact'|'comfortable'|'spacious',
 *   shadow: 'none'|'soft'|'medium'|'bold',
 *   bestFor: string,
 *   previewTab: string
 * }} ThemeTemplate
 */

/** @type {ThemeTemplate[]} */
export const THEME_TEMPLATES = [
  {
    id: "trust-saas",
    name: "Trust SaaS",
    tagline: "Calm authority for B2B products",
    emotion: "trust",
    psychology: "Blue + soft grey builds reliability and long-session comfort.",
    mode: "dark",
    background: "#0B1B33",
    text: "#F0F9FF",
    accent: "#3B82F6",
    radius: "lg",
    density: "comfortable",
    shadow: "soft",
    bestFor: "Dashboards, login, enterprise",
    previewTab: "dashboard",
  },
  {
    id: "luxury-noir",
    name: "Luxury Noir",
    tagline: "Quiet prestige after dark",
    emotion: "luxury",
    psychology: "Deep violet + gold accents signal exclusivity without noise.",
    mode: "dark",
    background: "#120A1A",
    text: "#FAF5FF",
    accent: "#C4B5FD",
    radius: "xl",
    density: "spacious",
    shadow: "medium",
    bestFor: "Hero, product, premium brands",
    previewTab: "hero",
  },
  {
    id: "energy-launch",
    name: "Energy Launch",
    tagline: "Bold motion for startups",
    emotion: "energy",
    psychology: "High-contrast reds drive urgency and conversion on CTAs.",
    mode: "dark",
    background: "#1A0A0C",
    text: "#FFF1F2",
    accent: "#F43F5E",
    radius: "md",
    density: "compact",
    shadow: "bold",
    bestFor: "Hero CTAs, landing pages",
    previewTab: "hero",
  },
  {
    id: "joy-marketplace",
    name: "Joy Market",
    tagline: "Playful commerce energy",
    emotion: "joy",
    psychology: "Warm amber invites browsing and softens purchase anxiety.",
    mode: "light",
    background: "#FFFBEB",
    text: "#78350F",
    accent: "#D97706",
    radius: "2xl",
    density: "comfortable",
    shadow: "soft",
    bestFor: "Product cards, marketplaces",
    previewTab: "product",
  },
  {
    id: "safety-bank",
    name: "Safety Vault",
    tagline: "Secure, clinical calm",
    emotion: "safety",
    psychology: "Cool blue restraint reduces stress on sensitive forms.",
    mode: "light",
    background: "#F0F7FF",
    text: "#1E3A5F",
    accent: "#2563EB",
    radius: "md",
    density: "comfortable",
    shadow: "soft",
    bestFor: "Login, settings, fintech",
    previewTab: "login",
  },
  {
    id: "growth-nature",
    name: "Growth Nature",
    tagline: "Organic progress & wellness",
    emotion: "growth",
    psychology: "Greens imply health, progress, and sustainable systems.",
    mode: "dark",
    background: "#0A1F16",
    text: "#ECFDF5",
    accent: "#10B981",
    radius: "lg",
    density: "comfortable",
    shadow: "medium",
    bestFor: "Analytics, eco products",
    previewTab: "dashboard",
  },
  {
    id: "love-editorial",
    name: "Love Editorial",
    tagline: "Warm storytelling brands",
    emotion: "love",
    psychology: "Rose tones create intimacy for lifestyle and media.",
    mode: "light",
    background: "#FFF1F2",
    text: "#881337",
    accent: "#E11D48",
    radius: "xl",
    density: "spacious",
    shadow: "soft",
    bestFor: "Hero, product storytelling",
    previewTab: "hero",
  },
  {
    id: "creative-studio",
    name: "Creative Studio",
    tagline: "Expressive modern work",
    emotion: "creativity",
    psychology: "Purple sparks originality while staying product-usable.",
    mode: "dark",
    background: "#1A0B2E",
    text: "#FAF5FF",
    accent: "#A855F7",
    radius: "lg",
    density: "compact",
    shadow: "bold",
    bestFor: "Portfolios, creative tools",
    previewTab: "dashboard",
  },
  {
    id: "minimal-slate",
    name: "Minimal Slate",
    tagline: "Quiet neutral system",
    emotion: "calm",
    psychology: "Low saturation reduces cognitive load for daily tools.",
    mode: "dark",
    background: "#0F172A",
    text: "#F8FAFC",
    accent: "#94A3B8",
    radius: "md",
    density: "comfortable",
    shadow: "none",
    bestFor: "Docs, admin, utilities",
    previewTab: "dashboard",
  },
  {
    id: "royal-evening",
    name: "Royal Evening",
    tagline: "Regal night-time elegance",
    emotion: "royalty",
    psychology: "Deep purple + luminous type evokes status and ceremony.",
    mode: "dark",
    background: "#1A0B2E",
    text: "#E9D5FF",
    accent: "#A855F7",
    radius: "xl",
    density: "spacious",
    shadow: "medium",
    bestFor: "Luxury hero & product",
    previewTab: "product",
  },
];

export const RADIUS_OPTIONS = [
  { id: "sm", label: "Sharp", value: "6px", classHint: "sm" },
  { id: "md", label: "Soft", value: "10px", classHint: "md" },
  { id: "lg", label: "Round", value: "14px", classHint: "lg" },
  { id: "xl", label: "Pillish", value: "18px", classHint: "xl" },
  { id: "2xl", label: "Bubble", value: "24px", classHint: "2xl" },
];

export const DENSITY_OPTIONS = [
  { id: "compact", label: "Compact", scale: 0.9, pad: "0.75rem" },
  { id: "comfortable", label: "Comfort", scale: 1, pad: "1rem" },
  { id: "spacious", label: "Spacious", scale: 1.08, pad: "1.25rem" },
];

export const SHADOW_OPTIONS = [
  { id: "none", label: "Flat", css: "none" },
  { id: "soft", label: "Soft", css: "0 8px 28px rgba(0,0,0,0.12)" },
  { id: "medium", label: "Lift", css: "0 16px 40px rgba(0,0,0,0.22)" },
  { id: "bold", label: "Drama", css: "0 24px 56px rgba(0,0,0,0.35)" },
];

export function getRadiusPx(id) {
  return RADIUS_OPTIONS.find((r) => r.id === id)?.value || "14px";
}

export function getShadowCss(id, accent) {
  const base = SHADOW_OPTIONS.find((s) => s.id === id);
  if (!base || id === "none") return "none";
  if (id === "soft") return `0 8px 28px ${accent}22, 0 2px 8px rgba(0,0,0,0.08)`;
  if (id === "medium") return `0 16px 40px ${accent}28, 0 4px 12px rgba(0,0,0,0.12)`;
  if (id === "bold") return `0 24px 56px ${accent}33, 0 8px 20px rgba(0,0,0,0.2)`;
  return base.css;
}

export function findTemplate(id) {
  return THEME_TEMPLATES.find((t) => t.id === id) || null;
}
