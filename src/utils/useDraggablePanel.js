/**
 * Production-ready drag for floating SeeUI panels.
 *
 * Fixes common breakage:
 * - Stale React state during pointermove (uses refs)
 * - CSS enter animations with transform fighting left/top
 * - First-drag jump when panel used top:50% + translateY(-50%)
 * - Lost tracking when cursor leaves the panel (window listeners)
 * - Viewport overflow after resize
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * @param {object} options
 * @param {object} options.defaultStyle - CSS when not yet dragged (fixed anchors only, no transform centering)
 * @param {number} [options.width=360] - fallback width for clamping
 * @param {number} [options.height=480] - fallback height for clamping
 */
export function useDraggablePanel({
  defaultStyle = { left: 20, top: 80 },
  width = 360,
  height = 480,
} = {}) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null); // { x, y } once user has dragged
  const [isDragging, setIsDragging] = useState(false);

  const drag = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    raf: null,
    pending: null,
  });

  const clamp = useCallback(
    (x, y) => {
      const el = panelRef.current;
      const bw = el?.offsetWidth || width;
      const bh = el?.offsetHeight || height;
      const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const vh = typeof window !== "undefined" ? window.innerHeight : 900;
      const pad = 4;
      return {
        x: Math.max(pad, Math.min(x, vw - bw - pad)),
        y: Math.max(pad, Math.min(y, vh - bh - pad)),
      };
    },
    [width, height],
  );

  const applyPending = useCallback(() => {
    if (drag.current.pending) {
      setPos(drag.current.pending);
      drag.current.pending = null;
    }
    drag.current.raf = null;
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      // Left click / primary touch only
      if (e.pointerType === "mouse" && e.button !== 0) return;
      // Interactive controls opt out
      if (e.target.closest("[data-nodrag]")) return;

      const el = panelRef.current;
      if (!el) return;

      // Kill any enter animation that holds transform (main cause of "broken" drag)
      el.style.animation = "none";

      const rect = el.getBoundingClientRect();
      // Pin visual rect → absolute left/top immediately (no transform centering)
      const pinned = clamp(rect.left, rect.top);
      setPos(pinned);

      drag.current.active = true;
      drag.current.offsetX = e.clientX - rect.left;
      drag.current.offsetY = e.clientY - rect.top;
      setIsDragging(true);

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      // Prevent text selection while dragging
      e.preventDefault();
    },
    [clamp],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!drag.current.active) return;
      drag.current.pending = clamp(
        e.clientX - drag.current.offsetX,
        e.clientY - drag.current.offsetY,
      );
      if (drag.current.raf == null) {
        drag.current.raf = requestAnimationFrame(applyPending);
      }
    },
    [clamp, applyPending],
  );

  const onPointerUp = useCallback((e) => {
    if (!drag.current.active) return;
    drag.current.active = false;

    if (drag.current.raf != null) {
      cancelAnimationFrame(drag.current.raf);
      drag.current.raf = null;
    }
    if (drag.current.pending) {
      setPos(drag.current.pending);
      drag.current.pending = null;
    }
    setIsDragging(false);

    const el = panelRef.current;
    if (el && e?.pointerId != null) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Window listeners — keep tracking even if pointer leaves the panel
  useEffect(() => {
    const move = (e) => onPointerMove(e);
    const up = (e) => onPointerUp(e);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (drag.current.raf != null) cancelAnimationFrame(drag.current.raf);
    };
  }, [onPointerMove, onPointerUp]);

  // Keep panel on-screen after window resize
  useEffect(() => {
    const onResize = () => {
      setPos((p) => (p ? clamp(p.x, p.y) : p));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  const panelStyle = useMemo(() => {
    if (pos) {
      return {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        right: "auto",
        bottom: "auto",
        transform: "none",
        animation: "none",
        touchAction: "none",
        userSelect: isDragging ? "none" : undefined,
      };
    }
    return {
      position: "fixed",
      left: "auto",
      top: "auto",
      right: "auto",
      bottom: "auto",
      transform: "none",
      touchAction: "none",
      ...defaultStyle,
    };
  }, [pos, defaultStyle, isDragging]);

  /** Spread onto the panel root (or drag handle). */
  const dragProps = useMemo(
    () => ({
      onPointerDown,
      // move/up handled on window for reliability
    }),
    [onPointerDown],
  );

  return {
    panelRef,
    panelStyle,
    isDragging,
    dragProps,
  };
}
