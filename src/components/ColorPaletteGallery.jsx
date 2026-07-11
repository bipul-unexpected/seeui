/**
 * Color Palette Gallery — floating glass panel (same language as Color Picker).
 * Psychology-based BG / Text / Highlight cards · search · emotion filters · apply live.
 */

import { useCallback, useMemo, useState } from "react";
import { generatePsychologyPalettes } from "../utils/generatePsychologyPalettes";
import { useDraggablePanel } from "../utils/useDraggablePanel";

const INITIAL_COUNT = 24;
const LOAD_MORE_COUNT = 12;
const BOARD_W = 400;
const DEFAULT_PANEL_STYLE = {
  right: 24,
  top: 80,
  left: "auto",
  bottom: "auto",
};

const C = {
  label: "#D4D4DE",
  muted: "#B4B4C4",
  soft: "#A0A0B0",
  ink: "#F0F0F5",
  border: "rgba(255,255,255,0.14)",
  cardBg:
    "linear-gradient(155deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
};

const EMOTION_TABS = [
  { id: "all", label: "All" },
  { id: "trust", label: "Trust" },
  { id: "safety", label: "Safety" },
  { id: "calm", label: "Calm" },
  { id: "energy", label: "Energy" },
  { id: "love", label: "Love" },
  { id: "joy", label: "Joy" },
  { id: "optimism", label: "Optimism" },
  { id: "growth", label: "Growth" },
  { id: "harmony", label: "Harmony" },
  { id: "royalty", label: "Royalty" },
  { id: "creativity", label: "Creativity" },
  { id: "luxury", label: "Luxury" },
];

const IconMinus = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconRefresh = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
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
const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

function Section({ title, children, accent = "#818CF8", right = null }) {
  return (
    <div
      style={{
        margin: "0 12px 10px",
        padding: "10px 12px 12px",
        borderRadius: 16,
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {title ? (
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{
                width: 3,
                height: 12,
                borderRadius: 99,
                background: accent,
                boxShadow: `0 0 8px ${accent}88`,
                flexShrink: 0,
              }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: C.label }}
            >
              {title}
            </span>
          </div>
          {right}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/**
 * @param {object} props
 * @param {(p: object) => void} props.onApply
 * @param {string|null} [props.activeId]
 * @param {(id: string|null) => void} [props.onActiveId]
 * @param {boolean} [props.minimized]
 * @param {(v: boolean) => void} [props.onMinimizedChange]
 * @param {boolean} [props.showLauncher]
 */
export default function ColorPaletteGallery({
  onApply,
  activeId: controlledActiveId,
  onActiveId,
  minimized: minimizedProp,
  onMinimizedChange,
  showLauncher = true,
}) {
  const [palettes, setPalettes] = useState(() =>
    generatePsychologyPalettes(INITIAL_COUNT),
  );
  const [internalActive, setInternalActive] = useState(null);
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all"); // all | dark | light
  const [query, setQuery] = useState("");
  const [spinKey, setSpinKey] = useState(0);

  const [internalMinimized, setInternalMinimized] = useState(true);
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
    height: 640,
  });

  const activeId =
    controlledActiveId !== undefined ? controlledActiveId : internalActive;

  const setActive = useCallback(
    (id) => {
      if (onActiveId) onActiveId(id);
      else setInternalActive(id);
    },
    [onActiveId],
  );

  const handleRefreshAll = useCallback(() => {
    setPalettes(generatePsychologyPalettes(INITIAL_COUNT));
    setActive(null);
    setSpinKey((k) => k + 1);
  }, [setActive]);

  const handleLoadMore = useCallback(() => {
    setPalettes((prev) => [
      ...prev,
      ...generatePsychologyPalettes(LOAD_MORE_COUNT),
    ]);
  }, []);

  const handleApply = useCallback(
    (palette) => {
      setActive(palette.id);
      onApply?.({
        id: palette.id,
        background: palette.BackgroundColor || palette.background,
        text: palette.TextColor || palette.text,
        accent: palette.HighlightColor || palette.highlight,
        highlight: palette.HighlightColor || palette.highlight,
        BackgroundColor: palette.BackgroundColor || palette.background,
        TextColor: palette.TextColor || palette.text,
        HighlightColor: palette.HighlightColor || palette.highlight,
        emotion: palette.emotion,
        label: palette.label,
        mode: palette.mode,
      });
    },
    [onApply, setActive],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return palettes.filter((p) => {
      if (emotionFilter !== "all" && p.emotion !== emotionFilter) return false;
      if (modeFilter !== "all" && p.mode !== modeFilter) return false;
      if (!q) return true;
      return (
        (p.label || "").toLowerCase().includes(q) ||
        (p.emotion || "").toLowerCase().includes(q) ||
        (p.background || p.BackgroundColor || "").toLowerCase().includes(q)
      );
    });
  }, [palettes, emotionFilter, modeFilter, query]);

  // ── Minimised orb (only if launcher enabled) ───────────────────────────────
  if (minimized) {
    if (!showLauncher) return null;
    return (
      <>
        <style>{`
          @keyframes galPop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          .gal-pop{animation:galPop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;}
        `}</style>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="gal-pop fixed z-[60] flex items-center justify-center"
          title="Open color palette gallery"
          style={{
            right: 224,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(168,85,247,0.9))",
            border: "2.5px solid rgba(255,255,255,0.32)",
            boxShadow:
              "0 8px 32px rgba(99,102,241,0.4), 0 0 0 5px rgba(99,102,241,0.16)",
            color: "#FFF",
          }}
        >
          <IconGrid />
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes galFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .gal-enter{animation:galFade 0.22s ease both;}
        @keyframes galSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes galCardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .gal-card{animation:galCardIn 0.28s cubic-bezier(0.22,1,0.36,1) both;transition:transform 0.16s ease,box-shadow 0.16s ease,border-color 0.16s;}
        .gal-card:hover{transform:translateY(-2px);}
        .gal-tabs::-webkit-scrollbar{display:none;width:0;height:0;}
        .gal-tabs{scrollbar-width:none;}
      `}</style>

      <div
        ref={panelRef}
        className="gal-enter z-50 select-none"
        style={{
          ...panelStyle,
          width: `min(${BOARD_W}px, calc(100vw - 20px))`,
          maxHeight: "min(720px, calc(100vh - 36px))",
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
            borderBottom: `1px solid ${C.border}`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
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
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #FF8585, #EF4444)",
                }}
                title="Minimise"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #FFC97A, #F59E0B)",
                }}
              />
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #6EE7A8, #22C55E)",
                }}
                title="Minimise"
              />
            </div>
            <span
              className="text-[10px] font-black tracking-widest uppercase ml-1.5"
              style={{ color: C.label }}
            >
              Palette Gallery
            </span>
          </div>
          <div className="flex items-center gap-2" data-nodrag>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(99,102,241,0.22)",
                color: "#C7D2FE",
                border: "1px solid rgba(129,140,248,0.4)",
              }}
            >
              {filtered.length}
            </span>
            <div style={{ color: "#8B8B9A" }} aria-hidden>
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 seeui-no-scrollbar pt-3" data-nodrag>
          {/* Search + refresh */}
          <Section
            title="Browse psychology sets"
            accent="#818CF8"
            right={
              <button
                type="button"
                onClick={handleRefreshAll}
                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.22)",
                  color: "#C7D2FE",
                  border: "1px solid rgba(129,140,248,0.4)",
                }}
              >
                <span
                  key={spinKey}
                  className="inline-flex"
                  style={{
                    animation: spinKey ? "galSpin 0.55s ease" : undefined,
                  }}
                >
                  <IconRefresh />
                </span>
                Refresh
              </button>
            }
          >
            <div
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 mb-2"
              style={{
                background: "rgba(0,0,0,0.28)",
                border: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.soft }}>
                <IconSearch />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search emotion or hex…"
                className="flex-1 bg-transparent border-0 outline-none text-[12px] font-medium min-w-0"
                style={{ color: C.ink }}
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
            <p className="text-[10px] m-0 leading-relaxed" style={{ color: C.soft }}>
              Click a card to apply Background, Text &amp; Highlight to the live canvas.
            </p>
          </Section>

          {/* Mode */}
          <Section title="Mode" accent="#FBBF24">
            <div
              className="relative grid grid-cols-3 gap-1 p-1 rounded-2xl"
              style={{
                background: "rgba(0,0,0,0.28)",
                border: `1px solid ${C.border}`,
              }}
            >
              {[
                { id: "all", label: "All" },
                { id: "dark", label: "Dark" },
                { id: "light", label: "Light" },
              ].map((m) => {
                const on = modeFilter === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModeFilter(m.id)}
                    className="relative z-10 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{
                      color: on ? "#FFF" : C.muted,
                      background: on
                        ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.3))"
                        : "transparent",
                      border: on
                        ? "1px solid rgba(165,180,252,0.45)"
                        : "1px solid transparent",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Emotion filters */}
          <Section title="Emotion filter" accent="#F472B6">
            <div className="gal-tabs flex flex-wrap gap-1.5">
              {EMOTION_TABS.map((tab) => {
                const on = emotionFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEmotionFilter(tab.id)}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                    style={{
                      background: on
                        ? "linear-gradient(135deg, rgba(244,114,182,0.35), rgba(168,85,247,0.28))"
                        : "rgba(255,255,255,0.05)",
                      color: on ? "#FFF" : C.label,
                      border: on
                        ? "1px solid rgba(249,168,212,0.5)"
                        : `1px solid ${C.border}`,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Grid */}
          <Section
            title="Palettes"
            accent="#34D399"
            right={
              <span className="text-[9px] font-mono font-semibold" style={{ color: C.muted }}>
                {filtered.length} shown
              </span>
            }
          >
            {filtered.length === 0 ? (
              <div
                className="rounded-xl px-3 py-6 text-center text-[11px] font-semibold"
                style={{
                  color: C.muted,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px dashed ${C.border}`,
                }}
              >
                No palettes match — try another emotion or refresh
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((palette, index) => {
                  const isActive = activeId === palette.id;
                  const bg = palette.BackgroundColor || palette.background;
                  const tx = palette.TextColor || palette.text;
                  const hi = palette.HighlightColor || palette.highlight;

                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => handleApply(palette)}
                      className="gal-card group relative w-full text-left rounded-xl overflow-hidden"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 16}ms`,
                        border: isActive
                          ? "1.5px solid rgba(165,180,252,0.7)"
                          : `1px solid ${C.border}`,
                        boxShadow: isActive
                          ? "0 6px 22px rgba(99,102,241,0.3)"
                          : "0 2px 10px rgba(0,0,0,0.25)",
                        background: "rgba(0,0,0,0.22)",
                      }}
                    >
                      {/* Color strips */}
                      <div className="flex h-12">
                        <div className="flex-[2.2]" style={{ backgroundColor: bg }} />
                        <div className="flex-[1.2]" style={{ backgroundColor: tx }} />
                        <div className="flex-1" style={{ backgroundColor: hi }} />
                      </div>

                      {/* Meta on bg */}
                      <div className="px-2 py-2" style={{ backgroundColor: bg }}>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className="text-[9px] font-bold truncate"
                            style={{ color: tx }}
                          >
                            {palette.label}
                          </span>
                          <span
                            className="text-[7.5px] uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: `${hi}33`,
                              color: hi,
                              border: `1px solid ${hi}55`,
                            }}
                          >
                            {palette.mode}
                          </span>
                        </div>
                        <div
                          className="text-[11px] font-semibold leading-tight truncate"
                          style={{ color: tx }}
                        >
                          Aa Preview
                        </div>
                        <div
                          className="mt-1.5 h-1 w-8 rounded-full"
                          style={{ backgroundColor: hi }}
                        />

                        {/* Always-visible hex row */}
                        <div
                          className="mt-2 flex flex-col gap-0.5 rounded-lg px-1.5 py-1"
                          style={{
                            background: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {[
                            ["BG", bg],
                            ["TX", tx],
                            ["HL", hi],
                          ].map(([k, hex]) => (
                            <div
                              key={k}
                              className="flex items-center gap-1 text-[8px] font-mono"
                            >
                              <span
                                className="w-2 h-2 rounded-sm shrink-0"
                                style={{
                                  backgroundColor: hex,
                                  boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
                                }}
                              />
                              <span style={{ color: "rgba(255,255,255,0.55)" }}>
                                {k}
                              </span>
                              <span
                                className="font-semibold truncate"
                                style={{ color: "#FFF" }}
                              >
                                {hex}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isActive && (
                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #6366F1, #A855F7)",
                            color: "#FFF",
                            boxShadow: "0 2px 8px rgba(99,102,241,0.5)",
                          }}
                        >
                          <IconCheck />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleLoadMore}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.24))",
                  color: "#E0E7FF",
                  border: "1px solid rgba(129,140,248,0.4)",
                }}
              >
                <IconPlus />
                Load more · +{LOAD_MORE_COUNT}
              </button>
              <span className="text-[9px]" style={{ color: C.soft }}>
                {palettes.length} total
              </span>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div
          className="px-3 pt-2.5 pb-3 flex-shrink-0"
          style={{
            borderTop: `1px solid ${C.border}`,
            background: "linear-gradient(0deg, rgba(0,0,0,0.28), transparent)",
          }}
          data-nodrag
        >
          <p className="text-[9px] m-0 text-center" style={{ color: C.soft }}>
            Psychology gallery · BG / Text / Highlight · click to apply
          </p>
        </div>
      </div>
    </>
  );
}
