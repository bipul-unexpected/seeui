/**
 * Site sections mapped to human-psychology design goals.
 * Used for navigation, anchors, and Advanced UI Preview tabs.
 */

/** @typedef {{
 *   id: string,
 *   label: string,
 *   short: string,
 *   psychology: string,
 *   emotion: string,
 *   href: string,
 *   kind: 'page'|'anchor'|'preview'
 * }} PsychSection */

/**
 * Primary site navigation — ordered for a natural design journey:
 * Attention → Emotion → Memory → Decision → Trust → Action
 * @type {PsychSection[]}
 */
export const SITE_SECTIONS = [
  {
    id: "workspace",
    label: "Live Workspace",
    short: "Workspace",
    psychology: "Attention — see colors on a real canvas first",
    emotion: "focus",
    href: "/#workspace",
    kind: "anchor",
  },
  {
    id: "gallery",
    label: "Emotion Gallery",
    short: "Gallery",
    psychology: "Emotion — browse palettes tied to feelings",
    emotion: "curiosity",
    href: "/#gallery",
    kind: "anchor",
  },
  {
    id: "scale",
    label: "Color Scale 50–950",
    short: "Scale",
    psychology: "System — full Tailwind design tokens from primary emotion",
    emotion: "structure",
    href: "/#scale",
    kind: "anchor",
  },
  {
    id: "recent",
    label: "Recent Memory",
    short: "Recent",
    psychology: "Memory — reclaim palettes you already liked",
    emotion: "familiarity",
    href: "/#recent",
    kind: "anchor",
  },
  {
    id: "type",
    label: "Type Sampler",
    short: "Type",
    psychology: "Readability — how type feels with the palette",
    emotion: "clarity",
    href: "/#type",
    kind: "anchor",
  },
  {
    id: "extract",
    label: "Image Emotion",
    short: "Extract",
    psychology: "Perception — decode mood from real photos",
    emotion: "insight",
    href: "/extract",
    kind: "page",
  },
  {
    id: "gradient",
    label: "Gradient Builder",
    short: "Gradient",
    psychology: "Motion — animated mood fields for heroes",
    emotion: "flow",
    href: "/gradient",
    kind: "page",
  },
  {
    id: "preview",
    label: "UI Reality Check",
    short: "UI Preview",
    psychology: "Decision — test palettes on real product UI",
    emotion: "confidence",
    href: "/preview",
    kind: "page",
  },
];

/**
 * Advanced UI Preview tabs — each pattern maps to a psychological moment.
 * @type {Array<{
 *   id: string,
 *   label: string,
 *   short: string,
 *   description: string,
 *   psychology: string,
 *   emotion: string,
 *   principle: string
 * }>}
 */
export const PREVIEW_PSYCHOLOGY = [
  {
    id: "hero",
    label: "Hero Section",
    short: "Hero",
    description: "First impression",
    psychology:
      "Primacy effect — people form judgments in milliseconds. Headlines and CTAs must feel aligned.",
    emotion: "attention",
    principle: "First impression",
  },
  {
    id: "dashboard",
    label: "Analytics Dashboard",
    short: "Dashboard",
    description: "Trust & clarity",
    psychology:
      "Cognitive load theory — clear hierarchy and calm surfaces build trust in data-heavy UIs.",
    emotion: "trust",
    principle: "Clarity & trust",
  },
  {
    id: "product",
    label: "eCommerce Card",
    short: "Product",
    description: "Desire & action",
    psychology:
      "Approach motivation — price, rating, and highlight CTAs drive purchase intent.",
    emotion: "desire",
    principle: "Desire & action",
  },
  {
    id: "login",
    label: "Login Form",
    short: "Login",
    description: "Safety & security",
    psychology:
      "Perceived security — restrained color, clear focus states, and calm type reduce anxiety.",
    emotion: "safety",
    principle: "Safety & security",
  },
];

/**
 * Emotion quick-links for the preview page (human feelings → test that UI).
 */
export const EMOTION_JOURNEY = [
  {
    id: "trust",
    label: "Trust",
    hint: "Best tested on Dashboard + Login",
    previewTab: "dashboard",
  },
  {
    id: "energy",
    label: "Energy",
    hint: "Best tested on Hero CTAs",
    previewTab: "hero",
  },
  {
    id: "joy",
    label: "Joy",
    hint: "Best tested on Product cards",
    previewTab: "product",
  },
  {
    id: "safety",
    label: "Safety",
    hint: "Best tested on Login forms",
    previewTab: "login",
  },
  {
    id: "luxury",
    label: "Luxury",
    hint: "Best tested on Hero + Product",
    previewTab: "hero",
  },
  {
    id: "growth",
    label: "Growth",
    hint: "Best tested on Dashboard",
    previewTab: "dashboard",
  },
];
