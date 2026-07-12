# SeeUI

### Stop Guessing CSS. Test Backgrounds, Text, and Logos Instantly.

**SeeUI** is a free, browser-based **emotion color psychology generator** and live design workspace for developers and designers. Build accessible palettes, pair typography, export Tailwind design systems, generate multi-page brand books as PDF, extract emotions from images, and craft pro gradients — all in real time.

🌐 **Live:** [https://seeui.bipul.tech](https://seeui.bipul.tech)  
📦 **Repo:** [github.com/bipul-unexpected/seeui](https://github.com/bipul-unexpected/seeui)  
👤 **Built by:** [₿ïþµŁ ℛøŸ](https://github.com/bipul-unexpected) · [X @BipulUnexpected](https://x.com/BipulUnexpected)

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Pages & routes](#pages--routes)
4. [Floating tool panels](#floating-tool-panels)
5. [Export & Brand Book PDF](#export--brand-book-pdf)
6. [Local storage & workspace](#local-storage--workspace)
7. [Tech stack](#tech-stack)
8. [Project structure](#project-structure)
9. [Getting started](#getting-started)
10. [Environment variables](#environment-variables)
11. [Scripts](#scripts)
12. [Deployment](#deployment)
13. [SEO](#seo)
14. [Support / donations](#support--donations)
15. [License](#license)

---

## Overview

SeeUI turns brand **emotion** into production-ready design tokens:

| Input | Output |
|--------|--------|
| Emotions (trust, calm, energy, love…) | Background · Text · Accent palette |
| Live canvas colors | WCAG AA/AAA contrast scores |
| Emotion ID | Google Font heading + body pair |
| Primary accent | Full Tailwind **50–950** scale |
| Workspace state | Tailwind / CSS / AI README / **PDF Brand Book** |
| Photo or logo | Emotion + palette via Image Extractor |
| Emotion profile | Linear / radial / conic / mesh gradients |

The home page hero:

> **Stop Guessing CSS.**  
> *Test Backgrounds, Text,*  
> and Logos Instantly.

---

## Features

### Live workspace (`/`)

- **Live canvas** — page background, text, and accent update instantly.
- **Logo upload** — brand logo on the canvas; stored in localStorage; included in Brand Book PDF.
- **WCAG badge** — live contrast ratio and AA/AAA / Fail status.
- **TypographyPair badge** — active emotion font pair at a glance.
- **Custom themed cursor** — performance-safe accent orb (desktop).
- **Site loader** — premium first-paint loading animation.
- **Psychology Grid button** — navbar toggle to open/close the palette gallery.
- **Product suite cards** — Studio · Extract · Gradients (premium journey section).
- **Type sampler** — live heading / body scale on the page.
- **Recent history** — last palettes from all features.
- **Desktop-first** floating panels; mobile guidance for the full panel experience.

### Emotion-based color psychology

- Multi-select emotions (e.g. Trust, Safety, Calm, Energy, Love, Joy, Optimism, Growth, Harmony, Royalty, Creativity, Luxury).
- Dark / light mode generation.
- Generated **Background**, **Text**, **Accent** with psychology rationale.
- **Avoid** warnings for each emotion family.
- Live sync to main canvas (toggle Live / Paused).
- Export Tailwind / CSS / hex from the emotion board.
- Emotion typography pairing badge.

### Color Picker board (floating)

- Draggable glass panel (same language as other tools).
- Target: **Background** or **Text**.
- SV canvas + hue slider.
- Paste **HEX / RGB / HSL / HSV / CMYK**.
- Format chips (copy codes).
- Recent picks.
- Auto-contrast for text (reset to auto).
- Clear section borders for readability.

### Image color picker (floating)

- Upload / drag image; eyedropper on canvas.
- Resizable preview.
- Apply sample to background or text.
- Dominant palette extraction helpers.

### Typography board (floating)

- 40+ curated **Google Fonts** (sans, serif, display, mono, script, quirky).
- **Search** fonts.
- Category tabs + **Custom** tab.
- **Upload** custom fonts (`.ttf`, `.otf`, `.woff`, `.woff2`) via FontFace API.
- Custom fonts saved in localStorage.
- Weight pills + heading size slider.
- Live preview sample.
- Manual type overrides emotion pairing when selected.

### Psychology Palette Gallery (floating)

- Procedural psychology palettes (BG / Text / Highlight).
- Emotion filters + dark/light mode filter + search.
- Always-visible hex rows on cards.
- Click to apply (updates canvas + emotion + history).
- Refresh / load more.
- Open from **navbar “Psychology Grid”**, **bottom dock**, or page CTA.

### Design system scale (Tailwind 50–950)

- `generateColorScale(hex)` — pure HSL math (no color libraries).
- 11 stops: 50 → 950; input locked as **500**.
- Large Tailwind-style grid with auto ink contrast.
- One-click Tailwind config or CSS variables export.
- Bound to live accent / primary emotion color.

### Export Studio

- Modal (portal, above page content).
- **Select / deselect** sections: palette, scale, typography, accessibility, tokens, Tailwind, history, meta.
- Formats:
  - Full **JS code bundle** (commented)
  - **README.md (AI)** implementation brief
  - CSS tokens only
  - Tailwind config only
- Copy + download file.
- Brand Book PDF button (on-demand).
- **Delete all data** — clears every `seeui:*` localStorage key.

### Brand Book PDF (6 pages, A4)

Generated **only on download click** (not on every edit):

1. Cover + executive summary (+ **logo** if uploaded)
2. Emotion strategy & avoid list
3. Color system (HEX / RGB / **CMYK**)
4. Accessibility WCAG matrix
5. Typography hierarchy
6. UI mockups + tokens + session history (+ logo in header mock)

Uses `@react-pdf/renderer` with dynamic `Font.register`, lazy-loaded chunk, full-screen generating overlay.

### Emotion Design Studio (`/preview`)

- Premium **PreviewStudio** templates.
- Live palette + emotion typography.
- Theme templates, density, shadows, UI patterns.
- Apply palette back to main workspace.
- History sync across tabs.

### Image Emotion Extractor (`/extract`)

- Canvas-based color sampling.
- HSL → emotion mapping.
- Psychology summary + type pairing.
- Apply to workspace + history.

### Pro Gradient Builder (`/gradient`)

- Linear · Radial · Conic · Mesh.
- Emotion profiles.
- Flow animation.
- CSS export.
- Sync with active palette.

### Accessibility

- Relative luminance + contrast ratio (WCAG 2.1).
- Live **WcagBadge** (AA / AAA / Fail).
- Brand Book accessibility page with multi-pair matrix.

### UX polish

- **PanelDock** (Limelight Nav): Color · Image · Emotion · **Grid** · Type.
- Theme-reactive dock colors.
- Draggable panels (`useDraggablePanel`).
- Traffic-light minimize controls.
- Copy toasts.
- Scrollbars hidden (scroll still works).
- Donate modal (Stripe via Appwrite Functions).

### SEO

- Central config: `src/data/seo.js`
- Meta titles/descriptions/keywords per route
- Open Graph + Twitter cards
- JSON-LD: WebApplication, WebSite, Organization, FAQ, Breadcrumbs
- `sitemap.xml`, `robots.txt`, PWA `manifest.json`
- Canonical + hreflang links

---

## Pages & routes

| Path | Page |
|------|------|
| `/` | Live workspace (home) |
| `/preview` | Emotion Design Studio |
| `/extract` | Image Emotion Extractor |
| `/gradient` | Pro Gradient Builder |
| `/donate/success` | Donation success |
| `/donate/cancel` | Donation cancel |

Defined in `src/app/routes.ts` (React Router v7 SPA).

---

## Floating tool panels

Open from the **bottom Limelight dock** or related UI:

| Panel | Dock icon | Role |
|-------|-----------|------|
| Color Picker | Palette | Manual BG / text color |
| Image Picker | Image | Eyedropper from photo |
| Emotion Palette | Heart | Psychology multi-select |
| **Psychology Grid** | **Grid** | Gallery of generated sets |
| Typography | Type | Fonts, weights, upload |

Navbar: **Psychology Grid** toggles the gallery panel open/close.

---

## Export & Brand Book PDF

### Export Studio (Export button)

1. Opens themed modal  
2. Choose format + sections  
3. Copy or download  
4. Optional: generate Brand Book PDF  

### PDF generation flow

```
User clicks Download PDF
  → Read localStorage workspace snapshot
  → Register fonts
  → Render 6 A4 pages once
  → Trigger download
```

No PDF work runs on every color change (performance-safe).

---

## Local storage & workspace

| Key | Data |
|-----|------|
| `seeui:workspace-snapshot` | Full workspace (colors, emotion, type, scale, WCAG, logo, panels…) |
| `seeui:active-palette` | Shared palette for `/preview`, `/extract`, etc. |
| `seeui:palette-history` | Recent palettes (max 20) |
| `seeui:custom-fonts` | Uploaded font data URLs |
| `seeui:logo` / snapshot `logoUrl` | Brand logo (data URL) |

- Snapshot writes are **debounced** (~450ms).
- **Export Studio → Delete all data** clears every `seeui:*` key and reloads.
- Utility: `src/utils/clearSeeUIStorage.js`

Cross-tab sync via `CustomEvent` + `storage` events (`seeui:palette`, history events).

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 18 |
| Routing | React Router v7 (SPA) |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 + dynamic inline theme |
| Icons | Lucide React |
| PDF | `@react-pdf/renderer` |
| State / cache | React Query (layout), localStorage stores |
| Payments | Stripe via Appwrite Functions |
| Backend (optional) | Appwrite |

---

## Project structure

```
seeui/
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── manifest.json
│   └── favicon / icons / og-image
├── src/
│   ├── app/
│   │   ├── page.jsx              # Home workspace
│   │   ├── preview/page.jsx      # Design Studio
│   │   ├── extract/page.jsx      # Image Emotion
│   │   ├── gradient/page.jsx     # Gradient Builder
│   │   ├── root.tsx              # Meta, layout, SEO
│   │   ├── routes.ts
│   │   └── global.css
│   ├── components/
│   │   ├── brandbook/            # 6-page PDF system
│   │   ├── previews/             # Studio templates
│   │   ├── ui/limelight-nav.tsx  # Dock nav
│   │   ├── ColorBoard.jsx
│   │   ├── EmotionColorBoard.jsx
│   │   ├── ColorPaletteGallery.jsx
│   │   ├── TypographyBoard.jsx
│   │   ├── ColorScaleGrid.jsx
│   │   ├── ExportStudio.jsx
│   │   ├── PanelDock.jsx
│   │   ├── GradientStudio.jsx
│   │   ├── ImageEmotionExtractor.jsx
│   │   └── ...
│   ├── data/
│   │   ├── emotionColors.js
│   │   ├── emotionTypography.js
│   │   ├── fonts.js
│   │   ├── seo.js
│   │   └── ...
│   └── utils/
│       ├── colorScaleEngine.js
│       ├── wcagContrast.js
│       ├── exportBundle.js
│       ├── workspaceSnapshotStore.js
│       ├── customFontsStore.js
│       ├── gradientEngine.js
│       └── ...
├── package.json
├── DEPLOY.md
└── README.md
```

---

## Getting started

### Prerequisites

- **Node.js 18+**
- npm (or pnpm / yarn)

### Install & run

```bash
git clone https://github.com/bipul-unexpected/seeui.git
cd seeui
npm install
npm run dev
```

App defaults to **http://localhost:4000** (or the port Vite prints).

### Production build

```bash
npm run build
```

Client output: `build/client` (also copied to `dist` when `cp` is available).

> **Windows note:** the `cp -r build/client dist` step in `npm run build` may fail on PowerShell. Use the Appwrite/output directory `build/client`, or copy manually.

---

## Environment variables

Create a `.env` (or `.env.local`) in the project root:

```env
VITE_SITE_URL=http://localhost:4000

# Optional — donations (Appwrite + Stripe)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_FUNCTION_ID=your_function_id
```

Core color/typography/export features work **without** Appwrite. Donation checkout requires the function + Stripe setup.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start React Router / Vite dev server |
| `npm run build` | Production SPA build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Typegen + TypeScript check |

---

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Appwrite Sites:

- **Build:** `npm run build`
- **Output:** `build/client`
- **Install:** `npm install`

Also works on any static host (Netlify, Vercel static, Cloudflare Pages, S3, etc.) serving the SPA `index.html` with client-side routing.

---

## SEO

Configured for search and social:

- Route-level titles & descriptions (`src/data/seo.js`)
- Open Graph + Twitter large image cards
- JSON-LD: WebApplication, WebSite, Organization, FAQ, Breadcrumbs
- `public/sitemap.xml` — `/`, `/preview`, `/extract`, `/gradient`
- `public/robots.txt`
- Canonical + hreflang
- PWA `manifest.json`

**Home page H1 (UI):** *Stop Guessing CSS. Test Backgrounds, Text, and Logos Instantly.*  
**Document `<title>` (SEO):** full product keyword title from `seo.js` (not the H1).

After deploy, submit the sitemap in [Google Search Console](https://search.google.com/search-console).

---

## Support / donations

Optional **Support** button opens a donate modal (Stripe Checkout via Appwrite Cloud Function). Success/cancel routes:

- `/donate/success`
- `/donate/cancel`

---

## Feature map (quick)

```
SeeUI
├── Live workspace
│   ├── Colors (BG / Text / Accent)
│   ├── Logo
│   ├── WCAG
│   ├── Type sampler
│   └── History
├── Floating tools
│   ├── Color Board
│   ├── Image Color Picker
│   ├── Emotion Board
│   ├── Palette Gallery (Psychology Grid)
│   └── Typography Board
├── Design system
│   ├── Scale 50–950
│   ├── Export Studio
│   └── Brand Book PDF (6 pages)
├── Flagship pages
│   ├── /preview  Design Studio
│   ├── /extract  Image Emotion
│   └── /gradient Gradient Builder
└── Platform
    ├── LocalStorage workspace
    ├── SEO
    └── Donations (optional)
```

---

## License

See the [LICENSE](./LICENSE) file in this repository.

---

## Credits

Built for designers and developers who want **emotion-aware, accessible, export-ready** color systems without fighting CSS.

**Built by [₿ïþµŁ ℛøŸ](https://github.com/bipul-unexpected)**  
**SeeUI** · [seeui.bipul.tech](https://seeui.bipul.tech) · [GitHub](https://github.com/bipul-unexpected/seeui) · [X @BipulUnexpected](https://x.com/BipulUnexpected)
