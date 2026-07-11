/**
 * Emotion-Based Pro Gradient Builder & Animator
 * Sticky controls + immersive hero preview + multi-format export.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Play,
  Pause,
  Download,
  Sparkles,
} from "lucide-react";
import {
  EMOTION_OPTIONS,
  GRADIENT_EMOTIONS,
  GRADIENT_TYPES,
  generateEmotionStops,
  buildGradientCss,
  buildGradientStyle,
  exportRawCss,
  exportTailwindArbitrary,
  exportTailwindConfig,
  gradientToWorkspacePalette,
} from "../utils/gradientEngine";
import { copyToClipboard } from "../utils/exportPalette";

function useDebounced(value, ms = 80) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * @param {object} props
 * @param {(p: object) => void} [props.onApplyWorkspace]
 * @param {(msg: string) => void} [props.onToast]
 * @param {string} [props.initialEmotion]
 */
export default function GradientStudio({
  onApplyWorkspace,
  onToast,
  initialEmotion = "trust",
}) {
  const [emotion, setEmotion] = useState(initialEmotion);
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [isAnimated, setIsAnimated] = useState(false);
  const [variation, setVariation] = useState(0);
  const [exportOpen, setExportOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Angle drag uses local state; export/preview use debounced for heavy string work
  const debouncedAngle = useDebounced(angle, 40);

  const profile = GRADIENT_EMOTIONS[emotion] || GRADIENT_EMOTIONS.trust;
  const needsAngle = type === "linear" || type === "conic";

  const stops = useMemo(
    () => generateEmotionStops(emotion, { variation }),
    [emotion, variation],
  );

  const gradientCss = useMemo(
    () =>
      buildGradientCss({
        type,
        angle: debouncedAngle,
        stops,
      }),
    [type, debouncedAngle, stops],
  );

  const previewStyle = useMemo(
    () =>
      buildGradientStyle({
        type,
        angle: debouncedAngle,
        stops,
        isAnimated,
      }),
    [type, debouncedAngle, stops, isAnimated],
  );

  const regenerate = useCallback(() => {
    setVariation((v) => (v + 7) % 28);
  }, []);

  const handleCopy = useCallback(
    async (id, text) => {
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopiedId(id);
        onToast?.("Copied!");
        setTimeout(() => setCopiedId(null), 1600);
      }
    },
    [onToast],
  );

  const exports = useMemo(
    () => ({
      css: exportRawCss({
        type,
        angle: debouncedAngle,
        stops,
        isAnimated,
      }),
      tailwind: exportTailwindArbitrary({
        type,
        angle: debouncedAngle,
        stops,
      }),
      config: exportTailwindConfig({
        type,
        angle: debouncedAngle,
        stops,
        name: emotion,
      }),
    }),
    [type, debouncedAngle, stops, isAnimated, emotion],
  );

  const applyWorkspace = useCallback(() => {
    const pal = gradientToWorkspacePalette(emotion, stops);
    onApplyWorkspace?.(pal);
    onToast?.("Applied to workspace");
  }, [emotion, stops, onApplyWorkspace, onToast]);

  // Chrome colors for control panel (dark glass)
  const panelBg =
    "linear-gradient(165deg, rgba(22,22,30,0.97), rgba(12,12,18,0.99))";
  const panelBorder = "rgba(255,255,255,0.1)";
  const muted = "rgba(255,255,255,0.5)";
  const text = "#F8FAFC";
  const accent = stops[1]?.hex || "#818CF8";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
      {/* ── Sticky control panel ──────────────────────────────────────── */}
      <aside
        className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[340px] lg:self-start"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: panelBg,
            border: `1px solid ${panelBorder}`,
            boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: panelBorder }}
          >
            <div
              className="text-[9px] font-black uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Pro Gradient
            </div>
            <div className="text-sm font-extrabold" style={{ color: text }}>
              Emotion Builder
            </div>
            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: muted }}>
              Psychologically tuned multi-stop gradients with animation & export.
            </p>
          </div>

          <div
            className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto p-4"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Emotion */}
            <div>
              <div
                className="mb-2 text-[9px] font-black uppercase tracking-widest"
                style={{ color: muted }}
              >
                Emotion profile
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EMOTION_OPTIONS.map((e) => {
                  const active = emotion === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEmotion(e.id)}
                      className="rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95"
                      style={{
                        background: active ? `${accent}30` : "rgba(255,255,255,0.04)",
                        color: active ? text : muted,
                        border: active
                          ? `1px solid ${accent}60`
                          : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {e.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed" style={{ color: muted }}>
                {profile.psychology}
              </p>
            </div>

            {/* Type tabs */}
            <div>
              <div
                className="mb-2 text-[9px] font-black uppercase tracking-widest"
                style={{ color: muted }}
              >
                Gradient style
              </div>
              <div
                className="grid grid-cols-2 gap-1 rounded-xl p-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {GRADIENT_TYPES.map((t) => {
                  const active = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className="rounded-lg py-2 text-[11px] font-bold transition-all"
                      style={{
                        background: active ? `${accent}28` : "transparent",
                        color: active ? text : muted,
                        border: active
                          ? `1px solid ${accent}50`
                          : "1px solid transparent",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Angle */}
            <div style={{ opacity: needsAngle ? 1 : 0.4 }}>
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: muted }}
                >
                  Angle
                </span>
                <span className="font-mono text-[11px] font-bold" style={{ color: text }}>
                  {angle}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                disabled={!needsAngle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="grad-range w-full"
              />
              <div className="mt-2 flex justify-center">
                <div
                  className="relative h-16 w-16 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${stops.map((s) => s.hex).join(", ")}, ${stops[0]?.hex})`,
                    boxShadow: `0 0 0 3px rgba(255,255,255,0.08), 0 8px 24px ${accent}33`,
                    opacity: needsAngle ? 1 : 0.5,
                  }}
                  aria-hidden
                >
                  <div
                    className="absolute left-1/2 top-1/2 h-1 w-6 origin-left rounded-full bg-white"
                    style={{
                      transform: `rotate(${angle - 90}deg) translateY(-50%)`,
                    }}
                  />
                  <div className="absolute inset-[28%] rounded-full bg-[#12121a]" />
                </div>
              </div>
              {!needsAngle && (
                <p className="mt-1 text-[9px]" style={{ color: muted }}>
                  Angle applies to Linear & Conic only.
                </p>
              )}
            </div>

            {/* Animation */}
            <div
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div className="text-[11px] font-bold" style={{ color: text }}>
                  Flowing animation
                </div>
                <div className="text-[9px]" style={{ color: muted }}>
                  CSS keyframes · background-size 200%
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnimated}
                onClick={() => setIsAnimated((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
                style={{
                  background: isAnimated ? `${accent}40` : "rgba(255,255,255,0.06)",
                  color: isAnimated ? text : muted,
                  border: `1px solid ${isAnimated ? accent : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {isAnimated ? <Play size={13} /> : <Pause size={13} />}
              </button>
            </div>

            {/* Color stops */}
            <div>
              <div
                className="mb-2 text-[9px] font-black uppercase tracking-widest"
                style={{ color: muted }}
              >
                Color stops
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {stops.map((s, i) => (
                  <div key={s.hex + i} className="flex flex-col items-center gap-1">
                    <div
                      className="h-9 w-9 rounded-full shadow-lg ring-2 ring-white/20"
                      style={{ backgroundColor: s.hex }}
                      title={`${s.hex} · ${s.pos}%`}
                    />
                    <span className="font-mono text-[8px]" style={{ color: muted }}>
                      {s.pos}%
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={regenerate}
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: muted,
                  }}
                  title="Regenerate variation"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex flex-wrap gap-2 border-t p-3"
            style={{ borderColor: panelBorder }}
          >
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: text,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Download size={13} />
              {exportOpen ? "Hide export" : "Export code"}
            </button>
            {typeof onApplyWorkspace === "function" && (
              <button
                type="button"
                onClick={applyWorkspace}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${stops[0]?.hex})`,
                  color: profile.textOnGradient,
                  boxShadow: `0 8px 24px ${accent}40`,
                }}
              >
                <Sparkles size={13} />
                Apply workspace
              </button>
            )}
          </div>

          {/* Export blocks */}
          {exportOpen && (
            <div
              className="space-y-3 border-t p-3"
              style={{ borderColor: panelBorder }}
            >
              {[
                { id: "css", label: "Raw CSS", code: exports.css },
                {
                  id: "tw",
                  label: "Tailwind arbitrary",
                  code: exports.tailwind,
                },
                {
                  id: "cfg",
                  label: "Tailwind config",
                  code: exports.config,
                },
              ].map((block) => (
                <div key={block.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: muted }}
                    >
                      {block.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(block.id, block.code)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold"
                      style={{
                        color: copiedId === block.id ? "#34D399" : muted,
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      {copiedId === block.id ? (
                        <Check size={10} />
                      ) : (
                        <Copy size={10} />
                      )}
                      {copiedId === block.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre
                    className="max-h-28 overflow-auto rounded-lg p-2.5 text-[9px] leading-relaxed"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      color: "#E2E8F0",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    {block.code}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Immersive preview ─────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <div
          className="relative min-h-[420px] overflow-hidden rounded-2xl sm:min-h-[520px] lg:min-h-[640px]"
          style={{
            ...previewStyle,
            boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          }}
        >
          {/* Global keyframes for flow */}
          <style>{`
            @keyframes seeuiGradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .grad-range {
              -webkit-appearance: none;
              appearance: none;
              height: 6px;
              border-radius: 999px;
              background: linear-gradient(90deg, ${stops.map((s) => s.hex).join(", ")});
              outline: none;
            }
            .grad-range::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #fff;
              border: 2px solid ${accent};
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            }
            .grad-range:disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }
          `}</style>

          {/* Noise overlay for premium feel */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Hero content */}
          <div className="relative z-10 flex h-full min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[520px] sm:px-12 lg:min-h-[640px]">
            <span
              className="mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: profile.textOnGradient,
                border: "1px solid rgba(255,255,255,0.2)",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <Sparkles size={11} />
              {profile.label}
              {isAnimated ? " · Flowing" : ""}
            </span>

            <h2
              className="max-w-2xl text-3xl font-black leading-[1.08] tracking-tight transition-all duration-500 sm:text-5xl lg:text-6xl"
              style={{
                color: profile.textOnGradient,
                fontFamily: "'Inter', system-ui, sans-serif",
                textShadow: "0 4px 40px rgba(0,0,0,0.25)",
              }}
            >
              Gradients that feel intentional.
            </h2>

            <p
              className="mt-4 max-w-md text-sm leading-relaxed transition-all duration-500 sm:text-base"
              style={{
                color: profile.subText,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} · {stops.length}{" "}
              stops
              {needsAngle ? ` · ${angle}°` : ""} — designed from emotion
              psychology for real product heroes.
            </p>

            <button
              type="button"
              className="mt-8 rounded-full px-7 py-3 text-sm font-bold backdrop-blur-xl transition-all duration-300 active:scale-95"
              style={{
                background: profile.ctaBg,
                color: profile.ctaText,
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Get started free
            </button>

            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              {stops.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full px-2.5 py-1 text-[9px] font-mono font-bold backdrop-blur-md"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    color: profile.textOnGradient,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {s.hex}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p
          className="mt-3 text-[11px] leading-relaxed"
          style={{
            color: "rgba(148,163,184,0.9)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Preview CSS:{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-[10px] text-slate-300">
            {gradientCss.length > 120
              ? gradientCss.slice(0, 120) + "…"
              : gradientCss}
          </code>
        </p>
      </div>
    </div>
  );
}
