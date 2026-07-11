/**
 * Lightweight custom cursor — pure refs + single rAF.
 * No React setState on pointer events (prevents jank under heavy app work).
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const INTERACTIVE_SEL =
  "a,button,input,textarea,select,label,summary,[role='button'],[role='menuitem'],[role='tab'],[role='checkbox'],[role='option'],[role='switch'],[data-cursor='pointer']";

const TEXT_SEL =
  "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='range']):not([type='file']),textarea,[contenteditable='true']";

export default function CustomCursor({
  accent = "#6366F1",
  textColor = "#FFFFFF",
  background = "#0F172A",
  enabled = true,
}) {
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const smooth = useRef({ x: -200, y: -200 });
  const flags = useRef({ hov: false, press: false, text: false, vis: false });
  const theme = useRef({ accent, textColor, background });
  const raf = useRef(0);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    theme.current = { accent, textColor, background };
  }, [accent, textColor, background]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setOk(false);
      document.documentElement.classList.remove("seeui-custom-cursor");
      return;
    }

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) {
      setOk(false);
      document.documentElement.classList.remove("seeui-custom-cursor");
      return;
    }

    setOk(true);
    document.documentElement.classList.add("seeui-custom-cursor");

    let running = true;

    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      flags.current.vis = true;
    };

    // pointerover bubbles a lot — throttle hover detection to rAF tick flag only
    let overTarget = null;
    const onOver = (e) => {
      overTarget = e.target;
    };

    const onDown = () => {
      flags.current.press = true;
    };
    const onUp = () => {
      flags.current.press = false;
    };
    const onLeave = () => {
      flags.current.vis = false;
    };

    const paint = () => {
      if (!running) return;

      // Resolve hover max once per frame (cheap)
      if (overTarget instanceof Element) {
        const textEl = overTarget.closest(TEXT_SEL);
        const inter = overTarget.closest(INTERACTIVE_SEL);
        flags.current.text = !!textEl;
        flags.current.hov = !!inter && !textEl;
        overTarget = null;
      }

      const f = flags.current;
      const t = theme.current;
      const ease = 0.24;
      smooth.current.x += (pos.current.x - smooth.current.x) * ease;
      smooth.current.y += (pos.current.y - smooth.current.y) * ease;

      const dx = pos.current.x;
      const dy = pos.current.y;
      const sx = smooth.current.x;
      const sy = smooth.current.y;

      const ring = f.text ? 18 : f.press ? 18 : f.hov ? 40 : 26;
      const glow = f.hov ? 48 : 32;
      const dw = f.text ? 2 : f.press ? 4 : f.hov ? 5 : 7;
      const dh = f.text ? 12 : dw;
      const op = f.vis ? 1 : 0;

      const g = glowRef.current;
      const r = ringRef.current;
      const d = dotRef.current;

      if (g) {
        g.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%)`;
        g.style.width = glow + "px";
        g.style.height = glow + "px";
        g.style.opacity = f.vis ? (f.hov ? "0.45" : "0.22") : "0";
        g.style.background = `radial-gradient(circle, ${t.accent}99 0%, transparent 70%)`;
      }
      if (r) {
        r.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%)`;
        r.style.width = ring + "px";
        r.style.height = ring + "px";
        r.style.opacity = f.vis ? (f.hov ? "1" : "0.8") : "0";
        r.style.borderColor = f.text ? t.textColor : t.accent;
        r.style.backgroundColor = f.hov ? `${t.accent}22` : "transparent";
      }
      if (d) {
        d.style.transform = `translate3d(${dx}px,${dy}px,0) translate(-50%,-50%)`;
        d.style.width = dw + "px";
        d.style.height = dh + "px";
        d.style.borderRadius = f.text ? "2px" : "50%";
        d.style.opacity = String(op);
        d.style.backgroundColor = f.text ? t.textColor : t.accent;
      }

      raf.current = requestAnimationFrame(paint);
    };

    raf.current = requestAnimationFrame(paint);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      running = false;
      document.documentElement.classList.remove("seeui-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!ok || !enabled || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden
      className="seeui-cursor-root"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483000,
      }}
    >
      <div
        ref={glowRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "1.5px solid transparent",
          boxSizing: "border-box",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
          boxShadow: "0 0 14px rgba(99,102,241,0.25)",
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 7,
          height: 7,
          borderRadius: "50%",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
        }}
      />
    </div>,
    document.body,
  );
}
