import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import type { ReactNode } from "react";
import "./global.css";
import {
  SITE_URL,
  SITE_NAME,
  buildPageMeta,
  buildPageLinks,
  buildJsonLdGraph,
} from "../data/seo";

// ─── Global default SEO (home + fallback for all routes) ─────────────────────
export const meta = () => buildPageMeta("home");

export const links = () => [
  ...buildPageLinks("home"),
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
];

// ─── Error Boundary ────────────────────────────────────────────────────────────
export function ErrorBoundary() {
  const error = useRouteError() as
    | { statusText?: string; message?: string; data?: string; status?: number }
    | Error
    | unknown;

  let message = "We hit an unexpected error. Please refresh the page.";
  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object") {
    const e = error as {
      statusText?: string;
      message?: string;
      data?: string;
      status?: number;
    };
    message = e.statusText || e.message || e.data || message;
    if (e.status) message = `${e.status}: ${message}`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F172A",
        color: "#F8FAFC",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "2rem",
      }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
          }}>
          Oops!
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}>
          Something went wrong
        </h1>
        <p
          style={{
            color: "rgba(248,250,252,0.6)",
            lineHeight: 1.6,
            marginBottom: "1rem",
          }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => window.location.reload()}
            type="button"
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              border: "none",
              background: "linear-gradient(135deg, #60A5FA, #818CF8)",
              color: "#FFF",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(96,165,250,0.3)",
            }}>
            Refresh Page
          </button>
          <a
            href="/"
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#FFF",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}>
            Back home
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Root Layout ───────────────────────────────────────────────────────────────
export function Layout({ children }: { children: ReactNode }) {
  const jsonLd = buildJsonLdGraph();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
        {/* Sitewide structured data for rich results */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Crawlable landmark for assistive tech + SEO semantics */}
        <a
          href="#workspace"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}>
          Skip to {SITE_NAME} workspace
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return <Outlet />;
}

// Re-export for pages that need the constant
export { SITE_URL, SITE_NAME };
