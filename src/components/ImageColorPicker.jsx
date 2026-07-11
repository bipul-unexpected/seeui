import { useState, useRef, useCallback, useEffect } from "react";
import { useDraggablePanel } from "../utils/useDraggablePanel";

// ─── Color utils ──────────────────────────────────────────────────────────────
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// Very small dominant-color extractor — quantises RGB to a 4-bit-per-channel
// bucket, counts occurrences, returns the top-N averaged centroids.
function extractPalette(imageData, count = 6) {
  const data = imageData.data;
  const buckets = new Map();
  const step = 4 * 4; // sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += step) {
    const a = data[i + 3];
    if (a < 125) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // skip near-white / near-black extremes that flood palettes
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 18 || min > 240) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const entry = buckets.get(key);
    if (entry) {
      entry.r += r;
      entry.g += g;
      entry.b += b;
      entry.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, count);
  return sorted.map(({ r, g, b, n }) =>
    rgbToHex(Math.round(r / n), Math.round(g / n), Math.round(b / n)),
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconMinus = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCopy = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconDropper = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a4.43 4.43 0 0 0-6.28 0L7 12.17V17h4.83l7.56-7.56a4.43 4.43 0 0 0 0-6.28z" />
    <line x1="17.5" y1="7.5" x2="3" y2="22" />
  </svg>
);
const IconImage = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
const IconBg = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);
const IconText = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const BOARD_W = 360;
const CANVAS_MAX = 480; // longest side for pixel buffer (sampling quality)
const VIEW_W_MIN = 160;
const VIEW_W_MAX = 520;
const VIEW_H_MIN = 120;
const VIEW_H_MAX = 420;
const DEFAULT_PANEL_STYLE = { right: 92, bottom: 20, top: "auto", left: "auto" };

export default function ImageColorPicker({
  bgHex,
  textHex,
  onBgChange,
  onTextChange,
  minimized: minimizedProp,
  onMinimizedChange,
  showLauncher = true,
}) {
  const [target, setTarget] = useState("bg");
  const [imgSrc, setImgSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [hoverHex, setHoverHex] = useState(null);
  const [hoverPos, setHoverPos] = useState(null); // { x, y } in canvas px
  const [pickedHex, setPickedHex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Display size of the image preview (user-resizable)
  const [viewW, setViewW] = useState(280);
  const [viewH, setViewH] = useState(200);
  const [lockAspect, setLockAspect] = useState(true);
  const aspectRef = useRef(1.4);

  const [internalMinimized, setInternalMinimized] = useState(true);
  const isControlled = minimizedProp !== undefined;
  const minimized = isControlled ? Boolean(minimizedProp) : internalMinimized;
  const setMinimized = (next) => {
    const value = typeof next === "function" ? next(minimized) : next;
    if (!isControlled) setInternalMinimized(value);
    onMinimizedChange?.(value);
  };

  const panelWidth = Math.max(BOARD_W, viewW + 48);

  const { panelRef, panelStyle, isDragging, dragProps } = useDraggablePanel({
    defaultStyle: DEFAULT_PANEL_STYLE,
    width: panelWidth,
    height: 520 + Math.max(0, viewH - 200),
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageDataRef = useRef(null); // cached imageData for fast pixel reads

  // ── Image load → draw to canvas → extract palette ─────────────────────────
  const loadFile = useCallback((file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgSrc(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(
        CANVAS_MAX / img.naturalWidth,
        CANVAS_MAX / img.naturalHeight,
        1,
      );
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const ratio = w / h || 1.4;
      aspectRef.current = ratio;
      // Fit default view to aspect
      const defW = 280;
      const defH = Math.round(defW / ratio);
      setViewW(defW);
      setViewH(Math.max(VIEW_H_MIN, Math.min(VIEW_H_MAX, defH)));
      try {
        const data = ctx.getImageData(0, 0, w, h);
        imageDataRef.current = data;
        setPalette(extractPalette(data, 6));
      } catch {
        // CORS guard — only happens for non-data URLs
        imageDataRef.current = null;
        setPalette([]);
      }
    };
    img.src = imgSrc;
  }, [imgSrc]);

  const handleViewW = useCallback(
    (raw) => {
      const w = Math.max(VIEW_W_MIN, Math.min(VIEW_W_MAX, +raw));
      setViewW(w);
      if (lockAspect) {
        setViewH(
          Math.max(
            VIEW_H_MIN,
            Math.min(VIEW_H_MAX, Math.round(w / aspectRef.current)),
          ),
        );
      }
    },
    [lockAspect],
  );

  const handleViewH = useCallback(
    (raw) => {
      const h = Math.max(VIEW_H_MIN, Math.min(VIEW_H_MAX, +raw));
      setViewH(h);
      if (lockAspect) {
        setViewW(
          Math.max(
            VIEW_W_MIN,
            Math.min(VIEW_W_MAX, Math.round(h * aspectRef.current)),
          ),
        );
      }
    },
    [lockAspect],
  );

  // ── Pixel read at canvas (x, y) ────────────────────────────────────────────
  const pixelHexAt = useCallback((x, y) => {
    const data = imageDataRef.current;
    if (!data) return null;
    const px = Math.max(0, Math.min(data.width - 1, Math.round(x)));
    const py = Math.max(0, Math.min(data.height - 1, Math.round(y)));
    const i = (py * data.width + px) * 4;
    return rgbToHex(data.data[i], data.data[i + 1], data.data[i + 2]);
  }, []);

  const handleCanvasMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const hex = pixelHexAt(x, y);
      if (hex) {
        setHoverHex(hex);
        setHoverPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    [pixelHexAt],
  );

  const handleCanvasLeave = useCallback(() => {
    setHoverHex(null);
    setHoverPos(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const hex = pixelHexAt(x, y);
      if (!hex) return;
      setPickedHex(hex);
      if (target === "bg") onBgChange(hex);
      else onTextChange(hex);
    },
    [pixelHexAt, target, onBgChange, onTextChange],
  );

  const handleSwatchClick = useCallback(
    (hex) => {
      setPickedHex(hex);
      if (target === "bg") onBgChange(hex);
      else onTextChange(hex);
    },
    [target, onBgChange, onTextChange],
  );

  // ── Drop zone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      e.target.value = "";
    },
    [loadFile],
  );

  const clearImage = useCallback(() => {
    setImgSrc(null);
    setPalette([]);
    setHoverHex(null);
    setHoverPos(null);
    setPickedHex(null);
    imageDataRef.current = null;
  }, []);

  const accentColor = target === "bg" ? "#60A5FA" : "#F472B6";
  const accentGlow =
    target === "bg" ? "rgba(96,165,250,0.35)" : "rgba(244,114,182,0.35)";

  const displayHex = hoverHex || pickedHex || palette[0] || "#1F2937";

  // ─── Minimised: dock handles open when showLauncher is false ───────────────
  if (minimized) {
    if (!showLauncher) return null;
    return (
      <>
        <style>{`
          @keyframes icpPopIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          .icp-pop-in{animation:icpPopIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;}
          @keyframes icpOrbSweep{0%{transform:translateX(-100%) skewX(-20deg)}100%{transform:translateX(200%) skewX(-20deg)}}
          .icp-orb-sweep::before{
            content:"";position:absolute;top:0;left:0;width:60%;height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
            animation:icpOrbSweep 3.4s ease-in-out infinite;pointer-events:none;
          }
        `}</style>
        <button
          onClick={() => setMinimized(false)}
          className="icp-pop-in icp-orb-sweep fixed z-[60] flex items-center justify-center overflow-hidden"
          title="Open image color picker"
          style={{
            right: 88,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.85))",
            border: "2.5px solid rgba(255,255,255,0.32)",
            boxShadow:
              "0 8px 32px rgba(99,102,241,0.45), 0 0 0 5px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.3)",
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes icpFade{from{opacity:0}to{opacity:1}}
        .icp-enter{animation:icpFade 0.22s ease both;}

        .icp-glass-btn{position:relative;overflow:hidden;}
        .icp-glass-btn::before{
          content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transition:left 0.55s ease;
          pointer-events:none;
        }
        .icp-glass-btn:hover::before{left:150%;}

        .icp-dashed{
          background-image:
            linear-gradient(90deg, rgba(255,255,255,0.18) 50%, transparent 50%),
            linear-gradient(90deg, rgba(255,255,255,0.18) 50%, transparent 50%),
            linear-gradient(0deg, rgba(255,255,255,0.18) 50%, transparent 50%),
            linear-gradient(0deg, rgba(255,255,255,0.18) 50%, transparent 50%);
          background-position: 0 0, 0 100%, 0 0, 100% 0;
          background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
          background-size: 12px 1.5px, 12px 1.5px, 1.5px 12px, 1.5px 12px;
        }

        .icp-range{
          -webkit-appearance:none;appearance:none;height:6px;
          background:linear-gradient(90deg,rgba(99,102,241,0.3),rgba(168,85,247,0.35));
          border-radius:9999px;outline:none;
          box-shadow:inset 0 1px 2px rgba(0,0,0,0.35);
        }
        .icp-range::-webkit-slider-thumb{
          -webkit-appearance:none;width:14px;height:14px;border-radius:50%;
          background:linear-gradient(135deg,#A5B4FC,#C4B5FD);
          border:2px solid #FFF;cursor:pointer;
          box-shadow:0 2px 6px rgba(99,102,241,0.5);
        }
        .icp-range::-moz-range-thumb{
          width:14px;height:14px;border-radius:50%;
          background:linear-gradient(135deg,#A5B4FC,#C4B5FD);
          border:2px solid #FFF;cursor:pointer;
        }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      <div
        ref={panelRef}
        className="icp-enter z-50 select-none"
        style={{
          ...panelStyle,
          width: `min(${panelWidth}px, calc(100vw - 20px))`,
          maxHeight: "min(92vh, calc(100vh - 24px))",
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
          display: "flex",
          flexDirection: "column",
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
              Image Picker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: displayHex,
                  boxShadow: "0 0 0 1.5px rgba(255,255,255,0.18)",
                }}
              />
              <span
                className="text-[10px] font-mono font-semibold"
                style={{ color: "#B4B4C4" }}
              >
                {displayHex}
              </span>
            </div>
            <div style={{ color: "#8B8B9A", cursor: "grab" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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

        {/* ── Target toggle (BG / Text) ───────────────────────────────── */}
        <div className="px-4 pt-3 pb-2" data-nodrag>
          <div
            className="relative grid grid-cols-2 gap-1 p-1 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
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
              style={{ color: target === "bg" ? "#FFF" : "#666" }}
            >
              <span style={{ color: target === "bg" ? "#60A5FA" : "#A8A8B8" }}>
                <IconBg />
              </span>
              Apply to BG
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
              style={{ color: target === "text" ? "#FFF" : "#666" }}
            >
              <span style={{ color: target === "text" ? "#F472B6" : "#A8A8B8" }}>
                <IconText />
              </span>
              Apply to Text
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: textHex,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
                }}
              />
            </button>
          </div>
        </div>

        {/* ── Image / drop zone ───────────────────────────────────────── */}
        <div className="px-4 pt-1 pb-3" data-nodrag>
          {!imgSrc ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className="icp-glass-btn icp-dashed w-full flex flex-col items-center justify-center gap-2 rounded-2xl py-8 px-4 transition-all active:scale-[0.99]"
              style={{
                background: dragOver
                  ? "linear-gradient(135deg, rgba(96,165,250,0.14), rgba(139,92,246,0.10))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                border: `1px solid ${dragOver ? "rgba(96,165,250,0.45)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: dragOver
                  ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 4px rgba(96,165,250,0.15)"
                  : "inset 0 1px 0 rgba(255,255,255,0.04)",
                transition: "all 0.18s ease",
                cursor: "pointer",
                minHeight: 168,
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.18))",
                  border: "1px solid rgba(139,92,246,0.32)",
                  color: "#C7D2FE",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(99,102,241,0.22)",
                }}
              >
                <IconImage />
              </div>
              <span
                className="text-[12px] font-bold"
                style={{ color: "#D0D0D8" }}
              >
                Drop an image, or click to upload
              </span>
              <span
                className="text-[10px]"
                style={{ color: "#5A5A65" }}
              >
                PNG · JPG · SVG · WebP
              </span>
            </button>
          ) : (
            <div className="space-y-2.5">
              {/* Resize controls — width / height */}
              <div
                className="rounded-xl px-3 py-2.5 space-y-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[8.5px] font-black uppercase tracking-widest"
                    style={{ color: "#C4C4D0" }}
                  >
                    Preview size
                  </span>
                  <button
                    type="button"
                    onClick={() => setLockAspect((v) => !v)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: lockAspect
                        ? "rgba(99,102,241,0.22)"
                        : "rgba(255,255,255,0.05)",
                      color: lockAspect ? "#A5B4FC" : "#B4B4C4",
                      border: lockAspect
                        ? "1px solid rgba(99,102,241,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                    title="Lock aspect ratio"
                  >
                    {lockAspect ? "Locked · ratio" : "Free · W/H"}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold w-8" style={{ color: "#B4B4C4" }}>
                      W
                    </span>
                    <input
                      type="range"
                      min={VIEW_W_MIN}
                      max={VIEW_W_MAX}
                      value={viewW}
                      onChange={(e) => handleViewW(e.target.value)}
                      className="flex-1 icp-range"
                    />
                    <span className="text-[9px] font-mono w-9 text-right" style={{ color: "#A0A0AA" }}>
                      {viewW}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold w-8" style={{ color: "#B4B4C4" }}>
                      H
                    </span>
                    <input
                      type="range"
                      min={VIEW_H_MIN}
                      max={VIEW_H_MAX}
                      value={viewH}
                      onChange={(e) => handleViewH(e.target.value)}
                      className="flex-1 icp-range"
                    />
                    <span className="text-[9px] font-mono w-9 text-right" style={{ color: "#A0A0AA" }}>
                      {viewH}px
                    </span>
                  </div>
                </div>
              </div>

              {/* Canvas with hover magnifier */}
              <div
                className="relative rounded-2xl overflow-hidden mx-auto"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.04), 0 6px 20px rgba(0,0,0,0.35)",
                  width: viewW,
                  height: viewH,
                  maxWidth: "100%",
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMove}
                  onMouseLeave={handleCanvasLeave}
                  onClick={handleCanvasClick}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                    cursor: "crosshair",
                  }}
                />

                {/* Hover magnifier */}
                {hoverHex && hoverPos && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: hoverPos.x,
                      top: hoverPos.y,
                      transform: "translate(14px, -56px)",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: hoverHex,
                      border: "3px solid rgba(255,255,255,0.95)",
                      boxShadow:
                        "0 6px 22px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(0,0,0,0.4)",
                    }}
                  />
                )}
                {hoverHex && hoverPos && (
                  <div
                    className="absolute pointer-events-none text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md"
                    style={{
                      left: hoverPos.x,
                      top: hoverPos.y,
                      transform: "translate(14px, -8px)",
                      backgroundColor: "rgba(0,0,0,0.78)",
                      color: "#FFF",
                      letterSpacing: "0.06em",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    {hoverHex}
                  </div>
                )}

                {/* Crosshair dot at hover position */}
                {hoverPos && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: hoverPos.x,
                      top: hoverPos.y,
                      transform: "translate(-50%, -50%)",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.95)",
                      boxShadow:
                        "0 0 0 1px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  />
                )}
              </div>

              {/* Action row under image */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="icp-glass-btn flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    color: "#C0C0C8",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  title="Replace image"
                >
                  <IconUpload />
                  Replace
                </button>

                <button
                  onClick={clearImage}
                  className="icp-glass-btn flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(239,68,68,0.06))",
                    color: "#FCA5A5",
                    border: "1px solid rgba(239,68,68,0.28)",
                  }}
                  title="Remove image"
                >
                  <IconTrash />
                  Clear
                </button>

                <div className="flex-1" />

                {pickedHex && (
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(pickedHex)
                        .then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        })
                        .catch(() => {});
                    }}
                    className="icp-glass-btn flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    style={{
                      background: copied
                        ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))"
                        : `linear-gradient(135deg, ${accentColor}26, ${accentColor}10)`,
                      color: copied ? "#34D399" : accentColor,
                      border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : `${accentColor}55`}`,
                      boxShadow: copied
                        ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(34,197,94,0.2)"
                        : `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px ${accentGlow}`,
                    }}
                  >
                    {copied ? <IconCheck /> : <IconCopy />}
                    {copied ? "Copied" : pickedHex}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Dominant palette ────────────────────────────────────────── */}
        {imgSrc && palette.length > 0 && (
          <div
            className="px-4 pb-4 pt-2 flex items-center gap-2.5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "linear-gradient(0deg, rgba(0,0,0,0.15), transparent)",
            }}
            data-nodrag
          >
            <span
              className="text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0"
              style={{ color: "#3A3A45" }}
            >
              <IconDropper />
              Palette
            </span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {palette.map((c, i) => (
                <button
                  key={c + i}
                  onClick={() => handleSwatchClick(c)}
                  title={`Apply ${c}`}
                  className="rounded-full transition-all duration-150 active:scale-90"
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: c,
                    border:
                      c === pickedHex
                        ? "2px solid #FFF"
                        : "1.5px solid rgba(255,255,255,0.14)",
                    boxShadow:
                      c === pickedHex
                        ? `0 0 0 1.5px ${accentColor}66, 0 2px 6px ${accentGlow}`
                        : "0 1px 4px rgba(0,0,0,0.4)",
                    transform: c === pickedHex ? "scale(1.15)" : "scale(1)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
