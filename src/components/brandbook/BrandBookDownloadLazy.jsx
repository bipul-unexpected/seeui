/**
 * Lazy-load the PDF download control so @react-pdf/renderer
 * is only fetched when the button is first needed / visible.
 * PDF itself still generates ONLY on click (see BrandBookDownload).
 */

import { lazy, Suspense, useEffect, useState } from "react";

const BrandBookDownload = lazy(() => import("./BrandBookDownload"));

function IdleFallback({
  variant = "button",
  fontFamily,
  buttonBg,
  buttonColor,
  borderColor,
}) {
  if (variant === "menuItem") {
    return (
      <div className="w-full flex items-start gap-2.5 px-3 py-2.5 opacity-80">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold" style={{ color: "#E8E8F0" }}>
            Download Full Brand Book (PDF)
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: "#666" }}>
            Loading PDF engine…
          </div>
        </div>
        <span
          className="inline-block h-3 w-3 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold opacity-80 cursor-wait"
      style={{
        backgroundColor: buttonBg,
        color: buttonColor,
        border: `1px solid ${borderColor}`,
        fontFamily,
      }}
      aria-busy="true"
    >
      <span
        className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin"
        aria-hidden
      />
      Preparing…
    </button>
  );
}

/**
 * Loads react-pdf chunk on idle / first interaction — no PDF work until click.
 */
export default function BrandBookDownloadLazy(props) {
  const [enabled, setEnabled] = useState(false);

  // Prefetch chunk after idle so first click is faster, without compiling PDF
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) setEnabled(true);
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(start, { timeout: 4000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const t = setTimeout(start, 2000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        className={
          props.variant === "menuItem"
            ? "w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-white/5"
            : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95"
        }
        style={
          props.variant === "menuItem"
            ? { background: "transparent", border: "none", color: "#E8E8F0" }
            : {
                backgroundColor: props.buttonBg,
                color: props.buttonColor,
                border: `1px solid ${props.borderColor}`,
                fontFamily: props.fontFamily,
              }
        }
      >
        {props.variant === "menuItem" ? (
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold">Download Full Brand Book (PDF)</div>
            <div className="text-[10px] mt-0.5" style={{ color: "#666" }}>
              Click to load · generate on demand
            </div>
          </div>
        ) : (
          "Download Full Brand Book (PDF)"
        )}
      </button>
    );
  }

  return (
    <Suspense fallback={<IdleFallback {...props} />}>
      <BrandBookDownload {...props} />
    </Suspense>
  );
}
