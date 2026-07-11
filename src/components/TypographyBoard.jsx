/**
 * Production Typography Board — search, category tabs, custom font upload,
 * smooth list animations, localStorage persistence for custom type.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FONTS, { FONT_CATEGORIES, WEIGHT_LABELS } from "../data/fonts";
import { useDraggablePanel } from "../utils/useDraggablePanel";
import {
  addCustomFont,
  fileToCustomFont,
  readCustomFonts,
  registerAllCustomFonts,
  registerFontFace,
  removeCustomFont,
} from "../utils/customFontsStore";

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
const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </svg>
);
const IconUpload = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M20 20H4" />
  </svg>
);
const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

const BOARD_W = 340;
const DEFAULT_PANEL_STYLE = { right: 20, top: 72, left: "auto", bottom: "auto" };

// Eye-comfortable panel text tokens (dark glass UI)
const C = {
  label: "#C4C4D0",
  muted: "#A0A0B0",
  soft: "#8B8B9A",
  ink: "#F0F0F5",
  dim: "#D0D0DC",
  grip: "#6B6B7A",
};

const TABS = [
  { id: "all", label: "All" },
  ...FONT_CATEGORIES.filter((c) => c.id !== "all"),
  { id: "custom", label: "Custom" },
];

export default function TypographyBoard({
  fontSlug,
  fontWeight,
  fontSize,
  fontWeightsAvailable,
  onFontChange,
  onWeightChange,
  onSizeChange,
  minimized: minimizedProp,
  onMinimizedChange,
  showLauncher = true,
  customFonts: customFontsProp,
  onCustomFontsChange,
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [internalCustom, setInternalCustom] = useState(() => readCustomFonts());
  const [uploadError, setUploadError] = useState(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef(null);

  const customFonts =
    customFontsProp !== undefined ? customFontsProp : internalCustom;

  const setCustomFonts = useCallback(
    (next) => {
      if (customFontsProp === undefined) setInternalCustom(next);
      onCustomFontsChange?.(next);
    },
    [customFontsProp, onCustomFontsChange],
  );

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
    height: 620,
  });

  // Hydrate custom fonts into browser on mount
  useEffect(() => {
    registerAllCustomFonts(customFonts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const catalog = useMemo(() => {
    const base = FONTS.map((f) => ({ ...f, custom: false }));
    const customs = (customFonts || []).map((f) => ({
      ...f,
      custom: true,
      category: "custom",
    }));
    return [...customs, ...base];
  }, [customFonts]);

  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((f) => {
      if (category === "custom") {
        if (!f.custom) return false;
      } else if (category !== "all" && f.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.fileName && f.fileName.toLowerCase().includes(q))
      );
    });
  }, [catalog, category, query]);

  const activeFont = useMemo(
    () => catalog.find((f) => f.slug === fontSlug) || catalog[0] || FONTS[0],
    [catalog, fontSlug],
  );

  const handleUpload = useCallback(
    async (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      setUploadBusy(true);
      setUploadError(null);
      try {
        const font = await fileToCustomFont(file);
        const ok = await registerFontFace(font);
        if (!ok) throw new Error("Browser could not load this font");
        const next = addCustomFont(font);
        setCustomFonts(next);
        onFontChange?.(font);
        setCategory("custom");
      } catch (err) {
        setUploadError(err?.message || "Upload failed");
      } finally {
        setUploadBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [onFontChange, setCustomFonts],
  );

  const handleRemoveCustom = useCallback(
    (e, slug) => {
      e.stopPropagation();
      const next = removeCustomFont(slug);
      setCustomFonts(next);
      if (fontSlug === slug) {
        onFontChange?.(FONTS[0]);
      }
    },
    [fontSlug, onFontChange, setCustomFonts],
  );

  if (minimized) {
    if (!showLauncher) return null;
    return (
      <>
        <style>{`
          @keyframes typoPopIn{0%{transform:scale(0.4) translateY(-50%);opacity:0}70%{transform:scale(1.12) translateY(-50%)}100%{transform:scale(1) translateY(-50%);opacity:1}}
          .typo-pop-in{animation:typoPopIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;}
        `}</style>
        <button
          onClick={() => setMinimized(false)}
          className="typo-pop-in fixed z-[60] flex items-center justify-center overflow-hidden"
          title="Open typography panel"
          style={{
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(168,85,247,0.9))",
            border: "2px solid rgba(255,255,255,0.35)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            color: "#FFF",
          }}
        >
          <span className="text-2xl leading-none" style={{ fontFamily: activeFont.family, fontWeight: 700 }}>
            Aa
          </span>
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes typoFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .typo-enter{animation:typoFade 0.22s ease both;}
        @keyframes typoRowIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .typo-row{animation:typoRowIn 0.28s cubic-bezier(0.22,1,0.36,1) both;}
        .typo-glass-btn{position:relative;overflow:hidden;transition:transform 0.15s, background 0.15s, border-color 0.15s, color 0.15s;}
        .typo-glass-btn:hover{transform:translateY(-1px);}
        .typo-font-card{transition:transform 0.16s ease, background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;}
        .typo-font-card:hover{transform:translateY(-1px);}
        .typo-tabs-scroll{scrollbar-width:none;-ms-overflow-style:none;}
        .typo-tabs-scroll::-webkit-scrollbar{display:none;width:0;height:0;}
        .typo-range{
          -webkit-appearance:none;appearance:none;width:100%;height:8px;
          background:linear-gradient(90deg,rgba(99,102,241,0.35),rgba(168,85,247,0.35));
          border-radius:9999px;outline:none;
        }
        .typo-range::-webkit-slider-thumb{
          -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
          background:linear-gradient(135deg,#A5B4FC,#C4B5FD);
          border:2px solid #FFF;cursor:pointer;
          box-shadow:0 2px 8px rgba(99,102,241,0.5);
        }
        .typo-search::placeholder{color:#8B8B9A;}
      `}</style>

      <div
        ref={panelRef}
        className="typo-enter z-50 select-none"
        style={{
          ...panelStyle,
          width: `min(${BOARD_W}px, calc(100vw - 20px))`,
          maxHeight: "min(680px, calc(100vh - 36px))",
          borderRadius: 22,
          overflow: "hidden",
          background:
            "linear-gradient(155deg, rgba(28,28,34,0.96) 0%, rgba(18,18,24,0.98) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: isDragging
            ? "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(255,255,255,0.14)"
            : "0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
        {...dragProps}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full"
                style={{ background: "radial-gradient(circle at 30% 30%, #FF8585, #EF4444)" }}
                title="Minimise"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "radial-gradient(circle at 30% 30%, #FFC97A, #F59E0B)" }}
              />
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full"
                style={{ background: "radial-gradient(circle at 30% 30%, #6EE7A8, #22C55E)" }}
                title="Minimise"
              />
            </div>
            <span
              className="text-[10px] font-black tracking-widest uppercase ml-1.5"
              style={{ color: C.label }}
            >
              Typography
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.18))",
                border: "1px solid rgba(99,102,241,0.35)",
              }}
            >
              <span style={{ fontFamily: activeFont.family, fontWeight: 700, color: "#C4B5FD", fontSize: 13 }}>
                Aa
              </span>
            </div>
            <div style={{ color: C.grip }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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

        {/* Search + upload */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0 flex flex-col gap-2" data-nodrag>
          <div
            className="flex items-center gap-2 rounded-xl px-2.5 py-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ color: C.soft }}>
              <IconSearch />
            </span>
            <input
              className="typo-search flex-1 bg-transparent border-0 outline-none text-[12px] font-medium min-w-0"
              style={{ color: C.ink }}
              placeholder="Search fonts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[10px] font-bold"
                style={{ color: C.muted }}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadBusy}
              className="typo-glass-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(168,85,247,0.22))",
                border: "1px solid rgba(129,140,248,0.4)",
                color: "#E0E7FF",
                opacity: uploadBusy ? 0.7 : 1,
              }}
            >
              <IconUpload />
              {uploadBusy ? "Loading…" : "Upload custom font"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
          {uploadError ? (
            <p className="text-[10px] font-semibold m-0" style={{ color: "#FCA5A5" }}>
              {uploadError}
            </p>
          ) : (
            <p className="text-[9px] m-0" style={{ color: C.soft }}>
              TTF · OTF · WOFF · WOFF2 · saved in localStorage
            </p>
          )}
        </div>

        {/* Category tabs — wrap + visible labels */}
        <div className="px-3 pb-2 flex-shrink-0" data-nodrag>
          <div
            className="typo-tabs-scroll flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Font categories"
          >
            {TABS.map(({ id, label }) => {
              const active = category === id;
              const count =
                id === "all"
                  ? catalog.length
                  : id === "custom"
                    ? customFonts.length
                    : catalog.filter((f) => f.category === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(id)}
                  className="typo-glass-btn flex-shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.35))"
                      : "rgba(255,255,255,0.05)",
                    color: active ? "#FFFFFF" : C.label,
                    border: active
                      ? "1px solid rgba(165,180,252,0.55)"
                      : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: active
                      ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 10px rgba(99,102,241,0.28)"
                      : "none",
                  }}
                >
                  {label}
                  <span
                    className="ml-1 opacity-70 font-mono text-[9px]"
                    style={{ color: active ? "#E0E7FF" : C.soft }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font list */}
        <div
          className="px-3 pb-2 overflow-y-auto flex-1 seeui-no-scrollbar"
          data-nodrag
        >
          {filteredFonts.length === 0 ? (
            <div
              className="rounded-xl px-3 py-6 text-center text-[11px] font-semibold"
              style={{
                color: C.muted,
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              {category === "custom"
                ? "No custom fonts yet — upload a .ttf / .woff2"
                : "No fonts match your search"}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredFonts.map((font, i) => {
                const isActive = font.slug === fontSlug;
                return (
                  <button
                    key={font.slug}
                    type="button"
                    onClick={() => onFontChange?.(font)}
                    className="typo-font-card typo-row group flex items-center justify-between rounded-xl px-3 py-2.5 text-left w-full relative overflow-hidden"
                    style={{
                      animationDelay: `${Math.min(i, 12) * 18}ms`,
                      background: isActive
                        ? "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(168,85,247,0.2))"
                        : "rgba(255,255,255,0.035)",
                      border: isActive
                        ? "1px solid rgba(165,180,252,0.55)"
                        : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isActive
                        ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(99,102,241,0.2)"
                        : "none",
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "22%",
                          bottom: "22%",
                          width: 3,
                          borderRadius: 9999,
                          background: "linear-gradient(180deg, #A5B4FC, #C4B5FD)",
                        }}
                      />
                    )}
                    <div className="flex flex-col min-w-0 flex-1 pl-0.5">
                      <span
                        className="text-[16px] leading-tight truncate"
                        style={{
                          color: isActive ? "#FFFFFF" : C.dim,
                          fontFamily: font.family,
                          fontWeight: 500,
                        }}
                      >
                        {font.name}
                      </span>
                      <span
                        className="text-[9px] uppercase tracking-widest mt-0.5"
                        style={{
                          color: isActive ? "rgba(224,231,255,0.75)" : C.soft,
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {font.custom ? "custom" : font.category}
                        {" · "}
                        {font.weights?.length || 1} wt
                        {font.custom ? " · uploaded" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {font.custom ? (
                        <button
                          type="button"
                          title="Remove custom font"
                          onClick={(e) => handleRemoveCustom(e, font.slug)}
                          className="p-1.5 rounded-lg opacity-70 hover:opacity-100"
                          style={{
                            color: "#FCA5A5",
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }}
                        >
                          <IconTrash />
                        </button>
                      ) : null}
                      {isActive ? (
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, #818CF8, #A78BFA)",
                            color: "#FFF",
                          }}
                        >
                          <IconCheck />
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Weight + size */}
        <div
          className="px-3 pt-3 pb-3 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(0deg, rgba(0,0,0,0.22), transparent)",
          }}
          data-nodrag
        >
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.label }}>
                Weight
              </span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: C.muted }}>
                {WEIGHT_LABELS[fontWeight] || fontWeight}
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {(fontWeightsAvailable?.length
                ? fontWeightsAvailable
                : activeFont.weights || [400, 700]
              ).map((w) => {
                const active = w === fontWeight;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onWeightChange?.(w)}
                    className="typo-glass-btn text-[10px] px-2.5 py-1 rounded-lg"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.35))"
                        : "rgba(255,255,255,0.05)",
                      color: active ? "#FFF" : C.label,
                      border: active
                        ? "1px solid rgba(165,180,252,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                      fontFamily: activeFont.family,
                      fontWeight: w,
                      minWidth: 36,
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.label }}>
                Heading size
              </span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: C.muted }}>
                {fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="32"
              max="96"
              step="1"
              value={fontSize}
              onChange={(e) => onSizeChange?.(+e.target.value)}
              className="typo-range"
            />
          </div>

          {/* Live sample */}
          <div
            className="mt-3 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: C.soft }}>
              Preview
            </div>
            <div
              className="truncate"
              style={{
                fontFamily: activeFont.family,
                fontWeight,
                fontSize: Math.min(fontSize * 0.35, 22),
                color: C.ink,
                lineHeight: 1.2,
              }}
            >
              The quick brown fox
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
