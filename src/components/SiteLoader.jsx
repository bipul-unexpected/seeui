/**
 * Premium first-paint loader for SeeUI.
 * Shows briefly on app mount, then fades out.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * @param {object} [props]
 * @param {number} [props.minMs=700] minimum display time
 * @param {string} [props.accent='#818CF8']
 */
export default function SiteLoader({ minMs = 700, accent = "#818CF8" }) {
  const [phase, setPhase] = useState(/** @type {'show'|'out'|'gone'} */ ("show"));

  useEffect(() => {
    const t0 = performance.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const elapsed = performance.now() - t0;
      const wait = Math.max(0, minMs - elapsed);
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("out");
        window.setTimeout(() => {
          if (!cancelled) setPhase("gone");
        }, 420);
      }, wait);
    };

    // Wait for fonts + next frame so hero isn't blank under the loader
    if (document.fonts?.ready) {
      document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }

    // Safety max
    const hard = window.setTimeout(finish, Math.max(minMs + 400, 1600));

    return () => {
      cancelled = true;
      clearTimeout(hard);
    };
  }, [minMs]);

  if (phase === "gone" || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="seeui-site-loader fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 2147483600,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.18), transparent 55%), #07070c",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: phase === "out" ? "none" : "auto",
      }}
      aria-busy={phase === "show"}
      aria-label="Loading SeeUI"
    >
      <div className="relative mb-6 h-16 w-16">
        <span
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${accent}, #A855F7)`,
            boxShadow: `0 12px 40px ${accent}55`,
            animation: "seeuiLoaderPulse 1.4s ease-in-out infinite",
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-black tracking-tight">
          S
        </span>
        <span
          className="absolute -inset-2 rounded-3xl border border-white/10"
          style={{ animation: "seeuiLoaderRing 1.6s linear infinite" }}
        />
      </div>

      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/50 mb-2">
        SeeUI
      </div>
      <div className="text-sm font-bold text-white/90 mb-4">
        Preparing your workspace…
      </div>

      <div
        className="h-1 w-36 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: "40%",
            background: `linear-gradient(90deg, transparent, ${accent}, #A855F7, transparent)`,
            animation: "seeuiLoaderBar 1s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes seeuiLoaderPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.92; }
        }
        @keyframes seeuiLoaderRing {
          0% { transform: rotate(0deg); opacity: 0.4; }
          100% { transform: rotate(360deg); opacity: 0.7; }
        }
        @keyframes seeuiLoaderBar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
