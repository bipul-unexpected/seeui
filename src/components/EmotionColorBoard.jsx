/**
 * EmotionColorBoard — Emotion-Based Color Psychology Generator
 * Floating glass panel; live-syncs palette to the main SeeUI canvas.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  EMOTIONS,
  COLOR_FAMILIES,
  generatePalette,
  getAvoidWarnings,
} from "../data/emotionColors";
import { useDraggablePanel } from "../utils/useDraggablePanel";
import {
  toTailwindConfig,
  toCssVariables,
  toHexArray,
  copyToClipboard,
} from "../utils/exportPalette";
import WcagBadge from "./WcagBadge";
import TypographyPairBadge from "./TypographyPairBadge";
import { useDynamicFonts } from "../utils/useDynamicFonts";

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
const IconAlert = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconSparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
  </svg>
);
const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BOARD_W = 380;
const MAX_EMOTIONS = 4;

const FAMILY_CHIP = {
  red: { bg: "rgba(239,68,68,0.22)", border: "rgba(239,68,68,0.5)", text: "#FCA5A5" },
  yellow: { bg: "rgba(251,191,36,0.18)", border: "rgba(251,191,36,0.45)", text: "#FDE68A" },
  blue: { bg: "rgba(59,130,246,0.22)", border: "rgba(59,130,246,0.5)", text: "#93C5FD" },
  green: { bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.45)", text: "#86EFAC" },
  purple: { bg: "rgba(168,85,247,0.22)", border: "rgba(168,85,247,0.5)", text: "#D8B4FE" },
};

const DEFAULT_PANEL_STYLE = { left: 20, top: 72, right: "auto", bottom: "auto" };

// Eye-comfortable tokens (match ColorBoard section system)
const C = {
  label: "#D4D4DE",
  muted: "#B4B4C4",
  soft: "#A0A0B0",
  ink: "#F0F0F5",
  border: "rgba(255,255,255,0.14)",
  cardBg: "linear-gradient(155deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
};

/** Premium bordered section — same pattern as ColorBoard */
function Section({ title, children, accent = "#A78BFA", right = null }) {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmotionChip({ emotion, active, disabled, onToggle }) {
  const tint = FAMILY_CHIP[emotion.family];
  return (
    <button
      type="button"
      onClick={() => onToggle(emotion.id)}
      disabled={disabled && !active}
      title={`${emotion.label} → ${COLOR_FAMILIES[emotion.family].name}`}
      className="ecb-glass-btn flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10.5px] font-bold active:scale-95 transition-all duration-150"
      style={{
        background: active ? tint.bg : "rgba(255,255,255,0.06)",
        color: active ? tint.text : C.muted,
        border: active ? `1px solid ${tint.border}` : `1px solid ${C.border}`,
        boxShadow: active
          ? `inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 10px ${tint.bg}`
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        opacity: disabled && !active ? 0.4 : 1,
        cursor: disabled && !active ? "not-allowed" : "pointer",
      }}
    >
      <span className="text-[11px] leading-none" aria-hidden>
        {emotion.emoji}
      </span>
      {emotion.label}
      {active && (
        <span
          className="flex items-center justify-center w-3.5 h-3.5 rounded-full ml-0.5"
          style={{ background: tint.border, color: "#0A0A0A" }}
        >
          <IconCheck />
        </span>
      )}
    </button>
  );
}

function PaletteSwatches({ palette, onCopyHex, copied }) {
  const items = [
    { key: "background", label: "Background", hex: palette.background, sub: palette.labels?.background },
    { key: "text", label: "Text", hex: palette.text, sub: palette.labels?.text },
    { key: "accent", label: "Accent", hex: palette.accent, sub: palette.labels?.accent },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ key, label, hex, sub }) => (
        <button
          key={key}
          type="button"
          onClick={() => onCopyHex(hex)}
          title={`Copy ${hex}`}
          className="ecb-glass-btn group flex flex-col rounded-xl overflow-hidden active:scale-[0.97] transition-transform"
          style={{
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          <div className="h-11 w-full transition-colors duration-300" style={{ backgroundColor: hex }} />
          <div
            className="px-2 py-1.5 flex flex-col items-start gap-0.5"
            style={{
              background: "rgba(0,0,0,0.35)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "#C8C8D4" }}>
              {label}
            </span>
            <span className="text-[9.5px] font-mono font-bold leading-none" style={{ color: copied === hex ? "#6EE7B7" : "#F0F0F5" }}>
              {copied === hex ? "Copied" : hex}
            </span>
            {sub && (
              <span className="text-[8px] truncate w-full" style={{ color: "#B0B0BE" }}>
                {sub}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/** Mini website mock — mirrors main canvas colors. */
function LivePreview({ palette }) {
  const { background, text, accent } = palette;
  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: background,
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{ background: "rgba(0,0,0,0.22)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
        <span className="ml-2 text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>
          live · main page
        </span>
      </div>
      <div className="px-5 py-5 flex flex-col gap-2.5">
        <span
          className="inline-flex self-start text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${accent}28`, color: accent, border: `1px solid ${accent}55` }}
        >
          Live on page
        </span>
        <h3 className="text-[16px] font-extrabold leading-[1.15] tracking-tight" style={{ color: text }}>
          Design that feels right.
        </h3>
        <p className="text-[11px] leading-relaxed max-w-[92%]" style={{ color: text, opacity: 0.7 }}>
          Background, type, and CTAs update on the main canvas as you pick emotions.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span
            className="rounded-full px-3.5 py-1.5 text-[10.5px] font-bold"
            style={{ backgroundColor: accent, color: background, boxShadow: `0 4px 14px ${accent}55` }}
          >
            Get started
          </span>
          <span
            className="rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold"
            style={{ color: text, border: `1px solid ${text}40` }}
          >
            Learn more
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main board ───────────────────────────────────────────────────────────────

export default function EmotionColorBoard({
  onApplyPalette,
  minimized: minimizedProp,
  onMinimizedChange,
  showLauncher = true,
}) {
  const [selected, setSelected] = useState(["trust", "creativity"]);
  const [mode, setMode] = useState("dark");
  const [copied, setCopied] = useState(null);
  const [liveOn, setLiveOn] = useState(true);
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

  const palette = useMemo(() => generatePalette(selected, mode), [selected, mode]);
  const warnings = useMemo(() => getAvoidWarnings(selected, 4), [selected]);
  const atLimit = selected.length >= MAX_EMOTIONS;

  // Typography pair for the primary emotion (loads fonts when panel open)
  const typePair = useDynamicFonts(palette.emotion || selected[0] || "trust", {
    enabled: !minimized && selected.length > 0,
  });

  // Live-sync to main canvas only while panel is open (not on page load)
  const lastApplied = useRef("");
  useEffect(() => {
    if (minimized || !liveOn || typeof onApplyPalette !== "function") return;
    if (!selected.length) return;
    const key = `${palette.background}|${palette.text}|${palette.accent}|${palette.emotion || ""}`;
    if (key === lastApplied.current) return;
    lastApplied.current = key;
    onApplyPalette({
      ...palette,
      emotion: palette.emotion || selected[0],
    });
  }, [palette, liveOn, selected.length, onApplyPalette, minimized, selected]);

  const toggleEmotion = useCallback((id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_EMOTIONS) return prev;
      return [...prev, id];
    });
  }, []);

  const clearAll = useCallback(() => setSelected([]), []);

  const copyText = useCallback(async (text, key) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    }
  }, []);

  const handleExport = useCallback(() => {
    copyText(
      toTailwindConfig({
        background: palette.background,
        text: palette.text,
        accent: palette.accent,
        emotion: palette.emotion || selected[0],
        typography: typePair,
      }),
      "export",
    );
  }, [palette, copyText, selected, typePair]);

  const handleApplyOnce = useCallback(() => {
    if (typeof onApplyPalette === "function") {
      const payload = {
        ...palette,
        emotion: palette.emotion || selected[0],
      };
      lastApplied.current = `${payload.background}|${payload.text}|${payload.accent}|${payload.emotion || ""}`;
      // Explicit Apply records history (live sync does not)
      onApplyPalette(payload, {
        label: payload.label || "Emotion",
        emotion: payload.emotion,
        recordHistory: true,
      });
      setCopied("applied");
      setTimeout(() => setCopied(null), 1500);
    }
  }, [onApplyPalette, palette, selected]);

  // ── Minimised: dock handles open when showLauncher is false ───────────────
  if (minimized) {
    if (!showLauncher) return null;
    return (
      <>
        <style>{`
          @keyframes ecbPopIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          .ecb-pop-in{animation:ecbPopIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;}
        `}</style>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="ecb-pop-in fixed z-[60] flex items-center justify-center overflow-hidden"
          title="Open emotion color psychology"
          style={{
            right: 156,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(236,72,153,0.9), rgba(168,85,247,0.9))",
            border: "2.5px solid rgba(255,255,255,0.32)",
            boxShadow:
              "0 8px 32px rgba(236,72,153,0.4), 0 0 0 5px rgba(168,85,247,0.16), inset 0 1px 0 rgba(255,255,255,0.3)",
            cursor: "pointer",
            color: "#FFF",
          }}
        >
          <IconHeart />
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ecbFade{from{opacity:0}to{opacity:1}}
        .ecb-enter{animation:ecbFade 0.22s ease both;}
        .ecb-glass-btn{position:relative;overflow:hidden;}
        .ecb-glass-btn::before{
          content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent);
          transition:left 0.55s ease;pointer-events:none;
        }
        .ecb-glass-btn:hover::before{left:150%;}
      `}</style>

      <div
        ref={panelRef}
        className="ecb-enter z-50 select-none"
        style={{
          ...panelStyle,
          width: `min(${BOARD_W}px, calc(100vw - 20px))`,
          maxHeight: "min(700px, calc(100vh - 32px))",
          borderRadius: 22,
          overflow: "hidden",
          background: "linear-gradient(155deg, rgba(28,28,34,0.94) 0%, rgba(18,18,24,0.97) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: isDragging
            ? "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(255,255,255,0.14)"
            : "0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          cursor: isDragging ? "grabbing" : "default",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
        {...dragProps}
      >
        {/* Title bar — drag handle (no data-nodrag) */}
        <div
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{
            borderBottom: `1px solid ${C.border}`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full flex items-center justify-center group"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #FF8585, #EF4444)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
                title="Minimise"
              >
                <span className="opacity-0 group-hover:opacity-100" style={{ color: "rgba(80,0,0,0.7)" }}>
                  <IconMinus />
                </span>
              </button>
              <div className="w-3 h-3 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #FFC97A, #F59E0B)" }} />
              <button
                type="button"
                data-nodrag
                onClick={() => setMinimized(true)}
                className="w-3 h-3 rounded-full flex items-center justify-center group cursor-pointer"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #6EE7A8, #22C55E)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)",
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
            <span className="text-[10px] font-black tracking-widest uppercase ml-1.5" style={{ color: C.label }}>
              Emotion Palette
            </span>
          </div>

          <div className="flex items-center gap-2" data-nodrag>
            <div className="flex items-center -space-x-1">
              {[palette.background, palette.text, palette.accent].map((c, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full"
                  style={{
                    backgroundColor: c,
                    border: "1.5px solid rgba(20,20,26,0.9)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
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

        {/* Body — sectioned like ColorBoard */}
        <div
          className="overflow-y-auto flex-1 seeui-no-scrollbar pt-3"
          data-nodrag
        >
          <Section
            title="Main page preview"
            accent="#34D399"
            right={
              <button
                type="button"
                onClick={() => setLiveOn((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors"
                style={{
                  background: liveOn ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
                  color: liveOn ? "#6EE7B7" : C.muted,
                  border: liveOn
                    ? "1px solid rgba(52,211,153,0.4)"
                    : `1px solid ${C.border}`,
                }}
                title={liveOn ? "Live sync on — colors update the page" : "Live sync off"}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: liveOn ? "#22C55E" : "#888" }}
                />
                {liveOn ? "Live" : "Paused"}
              </button>
            }
          >
            <p className="text-[10px] m-0 leading-relaxed" style={{ color: C.soft }}>
              When <span style={{ color: "#6EE7B7", fontWeight: 700 }}>Live</span> is on, emotion
              colors push to the main canvas as you select feelings.
            </p>
          </Section>

          <Section
            title="Emotions"
            accent="#F472B6"
            right={
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-semibold" style={{ color: C.muted }}>
                  {selected.length}/{MAX_EMOTIONS}
                </span>
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      color: C.muted,
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((emotion) => (
                <EmotionChip
                  key={emotion.id}
                  emotion={emotion}
                  active={selected.includes(emotion.id)}
                  disabled={atLimit}
                  onToggle={toggleEmotion}
                />
              ))}
            </div>
          </Section>

          <Section title="Color mode" accent="#818CF8">
            <div
              className="relative grid grid-cols-2 gap-1 p-1 rounded-2xl"
              style={{
                background: "rgba(0,0,0,0.28)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                className="absolute top-1 bottom-1 rounded-xl transition-all duration-300"
                style={{
                  left: mode === "dark" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                  background:
                    mode === "dark"
                      ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.28))"
                      : "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(251,146,60,0.22))",
                  border:
                    mode === "dark"
                      ? "1px solid rgba(129,140,248,0.5)"
                      : "1px solid rgba(251,191,36,0.45)",
                }}
              />
              {["dark", "light"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="relative z-10 py-1.5 rounded-xl text-[11px] font-bold capitalize"
                  style={{ color: mode === m ? "#FFF" : C.muted }}
                >
                  {m}
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Generated palette"
            accent="#A78BFA"
            right={
              <WcagBadge
                textColor={palette.text}
                backgroundColor={palette.background}
              />
            }
          >
            <PaletteSwatches
              palette={palette}
              onCopyHex={(hex) => copyText(hex, hex)}
              copied={copied}
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                {
                  id: "tw",
                  label: "Tailwind",
                  fn: () =>
                    toTailwindConfig({
                      ...palette,
                      emotion: palette.emotion,
                      typography: typePair,
                    }),
                },
                {
                  id: "css",
                  label: "CSS + fonts",
                  fn: () =>
                    toCssVariables({
                      ...palette,
                      emotion: palette.emotion,
                      typography: typePair,
                    }),
                },
                { id: "hex", label: "Hex[]", fn: () => toHexArray(palette) },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => copyText(opt.fn(), opt.id)}
                  className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg"
                  style={{
                    background:
                      copied === opt.id
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(255,255,255,0.06)",
                    color: copied === opt.id ? "#6EE7B7" : C.muted,
                    border:
                      copied === opt.id
                        ? "1px solid rgba(52,211,153,0.4)"
                        : `1px solid ${C.border}`,
                  }}
                >
                  {copied === opt.id ? "Copied!" : opt.label}
                </button>
              ))}
            </div>

            {selected.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span style={{ color: "#A5B4FC" }}>
                    <IconSparkle />
                  </span>
                  <span
                    className="text-[8px] font-black uppercase tracking-widest"
                    style={{ color: C.label }}
                  >
                    Emotion typography
                  </span>
                </div>
                <TypographyPairBadge
                  pair={typePair}
                  mutedColor={C.muted}
                  textColor={C.ink}
                  isDark
                  accent="#A5B4FC"
                  fontFamily="'Inter', system-ui, sans-serif"
                />
              </div>
            )}
          </Section>

          <Section title="Panel preview" accent="#60A5FA">
            <LivePreview palette={palette} />
          </Section>

          <Section title="Warnings · avoid" accent="#F87171">
            <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
              {warnings.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[10px] leading-snug"
                  style={{ color: "#E8C4C4" }}
                >
                  <span
                    className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#F87171", boxShadow: "0 0 6px #F8717188" }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div
          className="px-3 pt-2.5 pb-3 flex-shrink-0 flex items-center gap-2"
          style={{
            borderTop: `1px solid ${C.border}`,
            background: "linear-gradient(0deg, rgba(0,0,0,0.28), transparent)",
          }}
          data-nodrag
        >
          <button
            type="button"
            onClick={handleExport}
            className="ecb-glass-btn flex-1 flex items-center justify-center gap-1.5 text-[10.5px] font-bold px-3 py-2 rounded-xl active:scale-[0.98]"
            style={{
              background:
                copied === "export"
                  ? "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.1))"
                  : "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(168,85,247,0.22))",
              color: copied === "export" ? "#34D399" : "#E0E7FF",
              border:
                copied === "export"
                  ? "1px solid rgba(34,197,94,0.4)"
                  : "1px solid rgba(99,102,241,0.4)",
            }}
          >
            {copied === "export" ? <IconCheck /> : <IconCopy />}
            {copied === "export" ? "Copied!" : "Export Tailwind"}
          </button>

          <button
            type="button"
            onClick={handleApplyOnce}
            className="ecb-glass-btn flex items-center justify-center gap-1.5 text-[10.5px] font-bold px-3 py-2 rounded-xl active:scale-[0.98]"
            style={{
              background:
                copied === "applied"
                  ? "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.1))"
                  : "linear-gradient(135deg, rgba(236,72,153,0.22), rgba(168,85,247,0.18))",
              color: copied === "applied" ? "#34D399" : "#F9A8D4",
              border:
                copied === "applied"
                  ? "1px solid rgba(34,197,94,0.4)"
                  : "1px solid rgba(236,72,153,0.35)",
            }}
            title="Push palette to main page"
          >
            {copied === "applied" ? <IconCheck /> : null}
            {copied === "applied" ? "Applied" : "Apply"}
          </button>
        </div>
      </div>
    </>
  );
}
