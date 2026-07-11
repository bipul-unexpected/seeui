import { useState, useRef, useCallback, useEffect } from "react";
import { useDraggablePanel } from "../utils/useDraggablePanel";

// ─── Color math ───────────────────────────────────────────────────────────────
function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [
    Math.round(f(5) * 255),
    Math.round(f(3) * 255),
    Math.round(f(1) * 255),
  ];
}
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  const v = max,
    s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min,
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return {
    h: Math.round((h / 6) * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
function rgbToCmyk(r, g, b) {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function parseColorInput(raw) {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  const hexM = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexM) {
    let h = hexM[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgbM =
    s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/) ||
    s.match(/^(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})$/);
  if (rgbM)
    return {
      r: Math.min(255, +rgbM[1]),
      g: Math.min(255, +rgbM[2]),
      b: Math.min(255, +rgbM[3]),
    };
  const hslM = s.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
  if (hslM) {
    const [r, g, b] = hslToRgb(+hslM[1], +hslM[2], +hslM[3]);
    return { r, g, b };
  }
  const hsvM = s.match(/hs[vb]\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
  if (hsvM) {
    const [r, g, b] = hsvToRgb(+hsvM[1], +hsvM[2], +hsvM[3]);
    return { r, g, b };
  }
  const cmykM = s.match(
    /cmyk\s*\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/,
  );
  if (cmykM) {
    const c = +cmykM[1] / 100,
      m = +cmykM[2] / 100,
      y = +cmykM[3] / 100,
      k = +cmykM[4] / 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
    };
  }
  const triM = s.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
  if (triM && +triM[1] <= 360 && +triM[2] <= 100 && +triM[3] <= 100) {
    const [r, g, b] = hsvToRgb(+triM[1], +triM[2], +triM[3]);
    return { r, g, b };
  }
  return null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCopy = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconMinus = () => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconAlert = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconBg = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);
const IconText = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);
const IconSparkle = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
  </svg>
);

// ─── FormatChip ───────────────────────────────────────────────────────────────
function FormatChip({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      title={`Copy ${label}: ${value}`}
      className="cb-glass-btn flex flex-col items-center gap-1 rounded-xl py-2.5 px-1.5 w-full active:scale-95 transition-all duration-150 cursor-pointer"
      style={{
        background: copied
          ? "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.1))"
          : "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
        border: "1px solid",
        borderColor: copied ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.14)",
        boxShadow: copied
          ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 10px rgba(34,197,94,0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center gap-1"
        style={{ color: copied ? "#6EE7B7" : "#C8C8D4" }}
      >
        <span className="text-[8px] font-black uppercase tracking-widest">
          {label}
        </span>
        {copied ? <IconCheck /> : <IconCopy />}
      </div>
      <span
        className="text-[8.5px] font-mono text-center leading-tight break-all font-semibold"
        style={{ color: copied ? "#A7F3D0" : "#E8E8F0" }}
      >
        {value}
      </span>
    </button>
  );
}

/** Section shell — clear premium dividers for the color board */
function Section({ title, children, accent = "#818CF8", className = "" }) {
  return (
    <div
      className={className}
      style={{
        margin: "0 14px 10px",
        padding: "10px 12px 12px",
        borderRadius: 16,
        background: "linear-gradient(155deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {title ? (
        <div className="flex items-center gap-2 mb-2.5">
          <span
            style={{
              width: 3,
              height: 12,
              borderRadius: 99,
              background: accent,
              boxShadow: `0 0 8px ${accent}88`,
            }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: "#D4D4DE" }}
          >
            {title}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

// ─── ColorBoard ───────────────────────────────────────────────────────────────
const BOARD_W = 600;
const MAX_HIST = 8;
const DEFAULT_PANEL_STYLE = { left: 20, bottom: 20, top: "auto", right: "auto" };

export default function ColorBoard({
  bgHex,
  textHex,
  onBgChange,
  onTextChange,
  onResetText,
  textIsAuto,
  /** Controlled open state from PanelDock (minimized = closed) */
  minimized: minimizedProp,
  onMinimizedChange,
  /** When false, hide the floating orb (dock handles open) */
  showLauncher = true,
}) {
  const [target, setTarget] = useState("bg");

  const initial = useRef(
    (() => {
      const p = parseColorInput(bgHex) || { r: 91, g: 127, b: 212 };
      return rgbToHsv(p.r, p.g, p.b);
    })(),
  );
  const [hue, setHue] = useState(initial.current.h);
  const [sat, setSat] = useState(initial.current.s);
  const [val, setVal] = useState(initial.current.v);

  const [history, setHistory] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);

  const [internalMinimized, setInternalMinimized] = useState(false);
  const isControlled = minimizedProp !== undefined;
  const minimized = isControlled ? Boolean(minimizedProp) : internalMinimized;
  const setMinimized = (next) => {
    const value = typeof next === "function" ? next(minimized) : next;
    if (!isControlled) setInternalMinimized(value);
    onMinimizedChange?.(value);
  };

  const { panelRef, panelStyle, isDragging, dragProps } = useDraggablePanel({
    defaultStyle: DEFAULT_PANEL_STYLE,
    width: BOARD_W,
    height: 520,
  });

  const canvasRef = useRef(null);
  const hueRef = useRef(null);
  const stateRef = useRef({
    hue: initial.current.h,
    sat: initial.current.s,
    val: initial.current.v,
  });
  const lastTarget = useRef(target);

  // Sync HSV when target switches
  useEffect(() => {
    if (lastTarget.current === target) return;
    lastTarget.current = target;
    const parsed = parseColorInput(target === "bg" ? bgHex : textHex);
    if (!parsed) return;
    const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    stateRef.current = { hue: hsv.h, sat: hsv.s, val: hsv.v };
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
  }, [target, bgHex, textHex]);

  const [r, g, b] = hsvToRgb(hue, sat, val);
  const hex = rgbToHex(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const pureHue = `hsl(${hue},100%,50%)`;

  const formats = [
    { label: "HEX", value: hex.replace("#", "") },
    { label: "RGB", value: `${r}, ${g}, ${b}` },
    { label: "CMYK", value: `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}` },
    { label: "HSV", value: `${hue}°, ${sat}%, ${val}%` },
    { label: "HSL", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
  ];

  const updateHSV = useCallback(
    (h, s, v, push = false) => {
      stateRef.current = { hue: h, sat: s, val: v };
      setHue(h);
      setSat(s);
      setVal(v);
      const [rr, gg, bb] = hsvToRgb(h, s, v);
      const newHex = rgbToHex(rr, gg, bb);
      if (target === "bg") onBgChange(newHex);
      else onTextChange(newHex);
      if (push)
        setHistory((p) =>
          [newHex, ...p.filter((c) => c !== newHex)].slice(0, MAX_HIST),
        );
    },
    [onBgChange, onTextChange, target],
  );

  // Canvas
  const pickCanvas = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      updateHSV(
        stateRef.current.hue,
        Math.round((x / rect.width) * 100),
        Math.round((1 - y / rect.height) * 100),
      );
    },
    [updateHSV],
  );
  const onCanvasDown = useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      pickCanvas(e);
    },
    [pickCanvas],
  );
  const onCanvasMove = useCallback(
    (e) => {
      if (!(e.buttons & 1)) return;
      pickCanvas(e);
    },
    [pickCanvas],
  );
  const onCanvasUp = useCallback(() => {
    setHistory((p) => [hex, ...p.filter((c) => c !== hex)].slice(0, MAX_HIST));
  }, [hex]);

  // Hue
  const pickHue = useCallback(
    (e) => {
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      updateHSV(
        Math.round((x / rect.width) * 360),
        stateRef.current.sat,
        stateRef.current.val,
      );
    },
    [updateHSV],
  );
  const onHueDown = useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      pickHue(e);
    },
    [pickHue],
  );
  const onHueMove = useCallback(
    (e) => {
      if (!(e.buttons & 1)) return;
      pickHue(e);
    },
    [pickHue],
  );

  // Paste
  const submitInput = useCallback(() => {
    const parsed = parseColorInput(inputVal);
    if (!parsed) {
      setInputError(true);
      setTimeout(() => setInputError(false), 900);
      return;
    }
    const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    updateHSV(hsv.h, hsv.s, hsv.v, true);
    setInputVal("");
    setInputError(false);
  }, [inputVal, updateHSV]);

  const clickHistory = useCallback(
    (c) => {
      const p = parseColorInput(c);
      if (!p) return;
      const hsv = rgbToHsv(p.r, p.g, p.b);
      updateHSV(hsv.h, hsv.s, hsv.v);
    },
    [updateHSV],
  );

  const accentColor = target === "bg" ? "#60A5FA" : "#F472B6";
  const accentGlow =
    target === "bg" ? "rgba(96,165,250,0.35)" : "rgba(244,114,182,0.35)";

  // ─── Minimised: dock handles open when showLauncher is false ───────────────
  if (minimized) {
    if (!showLauncher) return null;
    return (
      <>
        <style>{`
          @keyframes cbPopIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          .cb-pop-in{animation:cbPopIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;}
          @keyframes cbOrbSweep{0%{transform:translateX(-100%) skewX(-20deg)}100%{transform:translateX(200%) skewX(-20deg)}}
          .cb-orb-sweep::before{
            content:"";position:absolute;top:0;left:0;width:60%;height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);
            animation:cbOrbSweep 3s ease-in-out infinite;pointer-events:none;
          }
        `}</style>
        <button
          onClick={() => setMinimized(false)}
          className="cb-pop-in cb-orb-sweep fixed z-[60] flex items-center justify-center overflow-hidden"
          title="Open color picker"
          style={{
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: bgHex,
            border: "2.5px solid rgba(255,255,255,0.32)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 5px ${bgHex}33, inset 0 1px 0 rgba(255,255,255,0.3)`,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            cursor: "pointer",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "relative", zIndex: 1 }}
          >
            <path d="M20.84 4.61a4.43 4.43 0 0 0-6.28 0L7 12.17V17h4.83l7.56-7.56a4.43 4.43 0 0 0 0-6.28z" />
            <line x1="17.5" y1="7.5" x2="3" y2="22" />
          </svg>
        </button>
      </>
    );
  }

  // ─── Full board ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes cbShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
        .cb-shake{animation:cbShake 0.35s ease;}
        @keyframes cbFade{from{opacity:0}to{opacity:1}}
        .cb-enter{animation:cbFade 0.22s ease both;}

        .cb-glass-btn{position:relative;overflow:hidden;}
        .cb-glass-btn::before{
          content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transition:left 0.55s ease;
          pointer-events:none;
        }
        .cb-glass-btn:hover::before{left:150%;}
      `}</style>

      <div
        ref={panelRef}
        className="cb-enter z-50 select-none"
        style={{
          ...panelStyle,
          width: `min(${BOARD_W}px, calc(100vw - 20px))`,
          borderRadius: 22,
          overflow: "hidden",
          background:
            "linear-gradient(155deg, rgba(28,28,34,0.92) 0%, rgba(20,20,26,0.96) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: isDragging
            ? "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          cursor: isDragging ? "grabbing" : "default",
          userSelect: "none",
          zIndex: 50,
        }}
        {...dragProps}
      >
        {/* ── Title bar ───────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full flex items-center justify-center group"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #FF8585, #EF4444)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)",
                }}
                title="Minimise"
              >
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "rgba(80,0,0,0.7)" }}
                >
                  <IconMinus />
                </span>
              </button>
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #FFC97A, #F59E0B)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              />
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full flex items-center justify-center group cursor-pointer"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #6EE7A8, #22C55E)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)",
                }}
                title="Minimise"
              >
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "rgba(0,60,20,0.75)" }}
                >
                  <IconMinus />
                </span>
              </button>
            </div>
            <span
              className="text-[10px] font-black tracking-widest uppercase ml-1.5"
              style={{ color: "#C4C4D0" }}
            >
              Color Picker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: hex,
                  boxShadow: "0 0 0 1.5px rgba(255,255,255,0.18)",
                }}
              />
              <span
                className="text-[10px] font-mono font-semibold"
                style={{ color: "#B4B4C4" }}
              >
                {hex}
              </span>
            </div>
            <div style={{ color: "#8B8B9A", cursor: "grab" }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="9" cy="7" r="1.2" />
                <circle cx="15" cy="7" r="1.2" />
                <circle cx="9" cy="12" r="1.2" />
                <circle cx="15" cy="12" r="1.2" />
                <circle cx="9" cy="17" r="1.2" />
                <circle cx="15" cy="17" r="1.2" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Target toggle ───────────────────────────────────────────── */}
        <div className="pt-3" data-nodrag>
        <Section title="Edit target" accent="#60A5FA">
          <div
            className="relative grid grid-cols-2 gap-1 p-1 rounded-2xl"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="absolute top-1 bottom-1 rounded-xl transition-all duration-300"
              style={{
                left: target === "bg" ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
                background:
                  target === "bg"
                    ? "linear-gradient(135deg, rgba(96,165,250,0.3), rgba(59,130,246,0.22))"
                    : "linear-gradient(135deg, rgba(244,114,182,0.3), rgba(236,72,153,0.22))",
                border: `1px solid ${target === "bg" ? "rgba(96,165,250,0.4)" : "rgba(244,114,182,0.4)"}`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px ${target === "bg" ? "rgba(96,165,250,0.2)" : "rgba(244,114,182,0.2)"}`,
              }}
            />
            <button
              onClick={() => setTarget("bg")}
              className="relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
              style={{ color: target === "bg" ? "#FFF" : "#B8B8C8" }}
            >
              <span style={{ color: target === "bg" ? "#60A5FA" : "#C4C4D0" }}>
                <IconBg />
              </span>
              Background
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: bgHex,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
                }}
              />
            </button>
            <button
              onClick={() => setTarget("text")}
              className="relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
              style={{ color: target === "text" ? "#FFF" : "#B8B8C8" }}
            >
              <span style={{ color: target === "text" ? "#F472B6" : "#C4C4D0" }}>
                <IconText />
              </span>
              Text
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: textHex,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
                }}
              />
              {textIsAuto && target !== "text" && (
                <span
                  className="text-[7.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded ml-0.5"
                  style={{
                    background: "rgba(34,197,94,0.18)",
                    color: "#34D399",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  Auto
                </span>
              )}
            </button>
          </div>

          {target === "text" && (
            <div className="mt-2 flex items-center justify-between gap-2 px-2">
              <div
                className="flex items-center gap-1.5 text-[10px]"
                style={{ color: textIsAuto ? "#34D399" : "#B4B4C4" }}
              >
                <IconSparkle />
                <span className="font-semibold">
                  {textIsAuto ? "Auto contrast active" : "Manual override"}
                </span>
              </div>
              {!textIsAuto && (
                <button
                  onClick={onResetText}
                  className="cb-glass-btn text-[9.5px] font-bold px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                  style={{
                    background: "rgba(34,197,94,0.14)",
                    color: "#34D399",
                    border: "1px solid rgba(34,197,94,0.28)",
                  }}
                >
                  Reset to auto
                </button>
              )}
            </div>
          )}
        </Section>
        </div>

        {/* ── Preview + Canvas ────────────────────────────────────────── */}
        <Section title="Picker canvas" accent={accentColor} className="">
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{
            height: 188,
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="flex-shrink-0 flex flex-col justify-between p-3.5 relative overflow-hidden"
            data-nodrag
            style={{
              width: "31%",
              backgroundColor: hex,
              transition: "background-color 0.1s",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                pointerEvents: "none",
              }}
            />
            <span
              className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg self-start relative"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                color: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {target === "bg" ? "Background" : "Text Color"}
            </span>
            <div className="flex flex-col gap-1.5 relative">
              <span
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg self-start leading-none"
                style={{
                  backgroundColor: "rgba(0,0,0,0.38)",
                  color: "#FFF",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  letterSpacing: "0.07em",
                }}
              >
                {hex}
              </span>
              <span
                className="text-[8.5px] font-mono px-2 py-0.5 rounded-lg self-start"
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  color: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                {r}, {g}, {b}
              </span>
            </div>
          </div>

          <div
            ref={canvasRef}
            data-nodrag
            className="flex-1 relative"
            style={{
              cursor: "crosshair",
              background: `linear-gradient(to bottom,transparent,#000),linear-gradient(to right,#fff,${pureHue})`,
            }}
            onPointerDown={onCanvasDown}
            onPointerMove={onCanvasMove}
            onPointerUp={onCanvasUp}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${sat}%`,
                top: `${100 - val}%`,
                transform: "translate(-50%,-50%)",
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "2.5px solid #FFF",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.55),0 0 0 1.5px rgba(0,0,0,0.2)",
                backgroundColor: hex,
                transition: "background-color 0.04s",
              }}
            />
          </div>
        </div>

        {/* ── Hue slider ──────────────────────────────────────────────── */}
        <div className="pt-3" data-nodrag>
          <div className="flex items-center gap-3">
            <span
              className="text-[8.5px] font-black uppercase tracking-widest w-7 flex-shrink-0"
              style={{ color: "#D0D0DC" }}
            >
              HUE
            </span>
            <div className="flex-1 relative" style={{ height: 13 }}>
              <div
                ref={hueRef}
                className="w-full h-full rounded-full cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
                  boxShadow:
                    "inset 0 1px 4px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06)",
                }}
                onPointerDown={onHueDown}
                onPointerMove={onHueMove}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "2.5px solid #FFF",
                  backgroundColor: pureHue,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
                }}
              />
            </div>
            <span
              className="text-[10px] font-mono font-semibold w-9 text-right flex-shrink-0"
              style={{ color: "#E0E0EA" }}
            >
              {hue}°
            </span>
          </div>
        </div>
        </Section>

        {/* ── Paste input ─────────────────────────────────────────────── */}
        <Section title="Paste any format" accent="#A78BFA">
        <div data-nodrag>
          <div
            className={inputError ? "cb-shake" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 12,
              padding: "8px 12px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid",
              borderColor: inputError
                ? "rgba(239,68,68,0.55)"
                : "rgba(255,255,255,0.14)",
              boxShadow: inputError
                ? "0 0 0 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.04)"
                : "inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "border-color 0.15s,box-shadow 0.15s",
            }}
          >
            <span
              style={{
                color: inputError ? "#EF4444" : "#A8A8B8",
                flexShrink: 0,
              }}
            >
              {inputError ? <IconAlert /> : <IconSearch />}
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setInputError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitInput();
              }}
              placeholder={`Paste color for ${target === "bg" ? "background" : "text"}…`}
              spellCheck={false}
              className="flex-1 bg-transparent text-xs font-mono outline-none"
              style={{
                color: inputError ? "#EF4444" : "#D0D0D8",
                caretcolor: "#B4B4C4",
                minWidth: 0,
              }}
            />
            {inputVal && (
              <button
                onClick={submitInput}
                className="cb-glass-btn flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}1A)`,
                  color: accentColor,
                  border: `1px solid ${accentColor}55`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px ${accentGlow}`,
                }}
              >
                Apply
              </button>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {[
              "#FF6B6B",
              "rgb(100,200,150)",
              "hsl(260,80%,60%)",
              "hsv(30,90%,95%)",
              "cmyk(0,50,100,0)",
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setInputVal(ex);
                  setInputError(false);
                }}
                className="cb-glass-btn text-[7.5px] font-mono px-1.5 py-0.5 rounded-md active:scale-95 transition-transform"
                style={{
                  color: "#C4C4D0",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
        </Section>

        {/* ── Format chips ─────────────────────────────────────────────── */}
        <Section title="Copy codes" accent="#34D399">
        <div className="grid grid-cols-5 gap-1.5" data-nodrag>
          {formats.map(({ label, value }) => (
            <FormatChip key={label} label={label} value={value} />
          ))}
        </div>
        </Section>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <Section title="Recent & actions" accent="#F472B6">
        <div
          className="flex items-center justify-between gap-3"
          data-nodrag
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="text-[8.5px] font-black uppercase tracking-widest flex-shrink-0"
              style={{ color: "#D0D0DC" }}
            >
              Recent
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {history.length === 0 ? (
                <span className="text-[9px]" style={{ color: "#8B8B9A" }}>
                  Pick a colour…
                </span>
              ) : (
                history.map((c, i) => (
                  <button
                    key={c + i}
                    onClick={() => clickHistory(c)}
                    title={c}
                    className="rounded-full transition-all duration-150"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: c,
                      border:
                        c === hex
                          ? "2px solid #FFF"
                          : "1.5px solid rgba(255,255,255,0.12)",
                      boxShadow:
                        c === hex
                          ? `0 0 0 1.5px ${accentColor}66, 0 2px 6px ${accentGlow}`
                          : "0 1px 4px rgba(0,0,0,0.4)",
                      transform: c === hex ? "scale(1.18)" : "scale(1)",
                      transition: "transform 0.15s,box-shadow 0.15s",
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard
                .writeText(hex)
                .then(() => {
                  setCopiedHex(true);
                  setTimeout(() => setCopiedHex(false), 1600);
                })
                .catch(() => {});
            }}
            className="cb-glass-btn flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all duration-150 flex-shrink-0"
            style={{
              background: copiedHex
                ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))"
                : `linear-gradient(135deg, ${accentColor}26, ${accentColor}10)`,
              color: copiedHex ? "#34D399" : accentColor,
              border: "1px solid",
              borderColor: copiedHex
                ? "rgba(34,197,94,0.4)"
                : `${accentColor}55`,
              boxShadow: copiedHex
                ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(34,197,94,0.2)"
                : `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px ${accentGlow}`,
            }}
          >
            {copiedHex ? <IconCheck /> : <IconCopy />}
            {copiedHex ? "Copied!" : "Copy HEX"}
          </button>
        </div>
        </Section>
      </div>
    </>
  );
}
