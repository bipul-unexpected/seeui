/**
 * Brand Book PDF — ON-DEMAND generation only.
 *
 * Performance fix: never use PDFDownloadLink with a live document.
 * That recompiled the PDF whenever palette/props changed.
 *
 * Flow:
 *  1. Idle button (no PDF work)
 *  2. User clicks → loading UI
 *  3. Read localStorage workspace snapshot
 *  4. Register fonts + pdf() once
 *  5. Trigger browser download → idle
 */

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { pdf } from "@react-pdf/renderer";
import { prepareBrandBookFonts } from "../../utils/registerBrandFonts";
import {
  getLatestWorkspaceSnapshot,
  readWorkspaceSnapshot,
} from "../../utils/workspaceSnapshotStore";
import BrandBookPDF from "./BrandBookPDF";

/**
 * @param {object} props
 * @param {object} [props.snapshot]
 * @param {string} [props.background]
 * @param {string} [props.text]
 * @param {string} [props.accent]
 * @param {string} [props.emotion]
 * @param {object} [props.typography]
 * @param {object[]} [props.recent]
 * @param {boolean} [props.emotionTypeActive]
 * @param {number} [props.fontWeight]
 * @param {number} [props.fontSize]
 * @param {string} [props.manualFontName]
 * @param {string} [props.fontSlug]
 * @param {boolean} [props.isDark]
 * @param {boolean} [props.textIsAuto]
 * @param {string} [props.logoUrl]
 * @param {string} [props.rationale]
 * @param {string} [props.brandName]
 * @param {string} [props.fontFamily]
 * @param {string} [props.buttonBg]
 * @param {string} [props.buttonColor]
 * @param {string} [props.borderColor]
 * @param {'button'|'menuItem'} [props.variant]
 * @param {(msg?: string) => void} [props.onComplete]
 * @param {(err: Error) => void} [props.onError]
 */
export default function BrandBookDownload({
  snapshot,
  background,
  text,
  accent,
  emotion,
  typography,
  recent,
  emotionTypeActive,
  fontWeight,
  fontSize,
  manualFontName,
  fontSlug,
  isDark,
  textIsAuto,
  logoUrl,
  rationale,
  brandName = "SeeUI",
  fontFamily,
  buttonBg,
  buttonColor,
  borderColor,
  variant = "button",
  onComplete,
  onError,
}) {
  const [status, setStatus] = useState(/** @type {'idle'|'loading'|'error'} */ ("idle"));
  const [progress, setProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isMenu = variant === "menuItem";
  const busy = status === "loading";

  const shellStyle = isMenu
    ? undefined
    : {
        backgroundColor: buttonBg,
        color: buttonColor,
        border: `1px solid ${borderColor}`,
        fontFamily,
      };

  const resolveSnapshot = useCallback(() => {
    // Prefer persisted localStorage, then overlay any live props
    const stored = readWorkspaceSnapshot() || {};
    const live = {
      ...stored,
      ...(snapshot && typeof snapshot === "object" ? snapshot : {}),
      brandName: brandName || stored.brandName,
      background: background ?? snapshot?.background ?? stored.background,
      text: text ?? snapshot?.text ?? stored.text,
      accent:
        accent ??
        snapshot?.accent ??
        snapshot?.highlight ??
        stored.accent,
      emotion: emotion ?? snapshot?.emotion ?? stored.emotion,
      typography: typography ?? snapshot?.typography ?? stored.typography,
      recent: recent ?? snapshot?.recent ?? stored.recent,
      emotionTypeActive:
        emotionTypeActive ??
        snapshot?.emotionTypeActive ??
        stored.emotionTypeActive,
      fontWeight: fontWeight ?? snapshot?.fontWeight ?? stored.fontWeight,
      fontSize: fontSize ?? snapshot?.fontSize ?? stored.fontSize,
      manualFontName:
        manualFontName ?? snapshot?.manualFontName ?? stored.manualFontName,
      fontSlug: fontSlug ?? snapshot?.fontSlug ?? stored.fontSlug,
      isDark: isDark ?? snapshot?.isDark ?? stored.isDark,
      textIsAuto: textIsAuto ?? snapshot?.textIsAuto ?? stored.textIsAuto,
      logoUrl: logoUrl ?? snapshot?.logoUrl ?? stored.logoUrl,
      rationale: rationale ?? snapshot?.rationale,
      sourceLabel: "SeeUI Workspace · localStorage",
    };
    return getLatestWorkspaceSnapshot(live);
  }, [
    snapshot,
    brandName,
    background,
    text,
    accent,
    emotion,
    typography,
    recent,
    emotionTypeActive,
    fontWeight,
    fontSize,
    manualFontName,
    fontSlug,
    isDark,
    textIsAuto,
    logoUrl,
    rationale,
  ]);

  const handleDownload = useCallback(async () => {
    if (busy) return;
    setStatus("loading");
    setErrorMsg("");
    setProgress("Reading workspace from localStorage…");

    try {
      // Yield so React can paint the loading UI first
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const data = resolveSnapshot();
      setProgress("Loading brand fonts…");

      let pdfFonts = { heading: "Helvetica", body: "Helvetica" };
      try {
        pdfFonts = await prepareBrandBookFonts(data.typography);
      } catch {
        /* Helvetica fallback already set */
      }

      setProgress("Building multi-page Brand Book…");
      await new Promise((r) => setTimeout(r, 40));

      const doc = (
        <BrandBookPDF
          {...data}
          pdfFonts={pdfFonts}
          generatedAt={new Date().toISOString()}
        />
      );

      setProgress("Rendering PDF pages…");
      const blob = await pdf(doc).toBlob();

      setProgress("Starting download…");
      const emo = String(data.emotion || "brand")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `${(data.brandName || "seeui").toLowerCase()}-brand-book-${emo}-${date}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after download starts
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      setStatus("idle");
      setProgress("");
      onComplete?.(fileName);
    } catch (err) {
      console.error("Brand book PDF failed", err);
      const msg = err?.message || "PDF generation failed";
      setErrorMsg(msg);
      setStatus("error");
      setProgress("");
      onError?.(err instanceof Error ? err : new Error(msg));
    }
  }, [busy, resolveSnapshot, onComplete, onError]);

  const label =
    status === "loading"
      ? "Generating PDF…"
      : status === "error"
        ? "Retry Brand Book PDF"
        : "Download Full Brand Book (PDF)";

  const button = isMenu ? (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-70"
      style={{
        background: "transparent",
        border: "none",
        cursor: busy ? "wait" : "pointer",
      }}
      aria-busy={busy}
    >
      <div className="flex-1 min-w-0">
        <div
          className="text-[12px] font-bold"
          style={{ color: busy ? "#A5B4FC" : status === "error" ? "#FCA5A5" : "#E8E8F0" }}
        >
          {label}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: "#888" }}>
          {busy
            ? progress || "Working…"
            : "On click only · reads localStorage · 6 pages"}
        </div>
      </div>
      {busy ? <Spinner /> : <IconPdf />}
    </button>
  ) : (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-80"
      style={{
        ...shellStyle,
        cursor: busy ? "wait" : "pointer",
      }}
      aria-busy={busy}
    >
      {busy ? <Spinner /> : <IconPdf />}
      {label}
    </button>
  );

  return (
    <>
      {button}
      {busy && typeof document !== "undefined"
        ? createPortal(
            <PdfGeneratingOverlay progress={progress} />,
            document.body,
          )
        : null}
      {errorMsg && !busy ? (
        <span className="sr-only" role="alert">
          {errorMsg}
        </span>
      ) : null}
    </>
  );
}

function PdfGeneratingOverlay({ progress }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{
        zIndex: 2147482500,
        background: "rgba(2,6,23,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="w-full max-w-sm rounded-3xl px-6 py-7 text-center"
        style={{
          background:
            "linear-gradient(155deg, rgba(28,28,34,0.98), rgba(12,12,18,0.99))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 40px rgba(99,102,241,0.2)",
        }}
      >
        <div className="mx-auto mb-4 relative h-14 w-14">
          <span
            className="absolute inset-0 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin"
            style={{ animationDuration: "0.85s" }}
          />
          <span
            className="absolute inset-2 rounded-full border-2 border-violet-400/20 border-b-violet-400 animate-spin"
            style={{ animationDuration: "1.25s", animationDirection: "reverse" }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-indigo-300">
            <IconPdf size={18} />
          </span>
        </div>
        <div
          className="text-[11px] font-black uppercase tracking-widest mb-1"
          style={{ color: "rgba(165,180,252,0.85)" }}
        >
          Generating Brand Book
        </div>
        <div className="text-base font-extrabold text-white mb-2">
          Building your PDF…
        </div>
        <div className="text-[12px] leading-relaxed" style={{ color: "#A0A0B0" }}>
          {progress || "Analyzing saved workspace data"}
        </div>
        <div
          className="mt-5 h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full seeui-pdf-progress"
            style={{
              background: "linear-gradient(90deg, #6366F1, #A855F7, #6366F1)",
              backgroundSize: "200% 100%",
              width: "55%",
            }}
          />
        </div>
        <p className="mt-3 text-[10px]" style={{ color: "#6B6B7A" }}>
          Only runs when you click download · does not rebuild on every edit
        </p>
      </div>
      <style>{`
        @keyframes seeuiPdfBar {
          0% { transform: translateX(-40%); }
          100% { transform: translateX(160%); }
        }
        .seeui-pdf-progress {
          animation: seeuiPdfBar 1.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin"
      aria-hidden
    />
  );
}

function IconPdf({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 18 15 15" />
    </svg>
  );
}
