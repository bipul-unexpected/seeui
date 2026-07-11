/**
 * ColorScaleGrid — Tailwind-style 50–950 design system scale
 * with auto-contrast labels and one-click config export.
 */

import { useCallback, useMemo, useState } from "react";
import {
  generateColorScale,
  generateColorScaleMeta,
  formatTailwindScaleConfig,
  formatCssScaleVariables,
  scaleColorName,
} from "../utils/colorScaleEngine";
import { copyToClipboard } from "../utils/exportPalette";

/**
 * @param {object} props
 * @param {string} props.baseHex — primary emotion / accent color (500 base)
 * @param {string} [props.colorName] — tailwind key name e.g. "brand", "trust"
 * @param {string} [props.emotionLabel]
 * @param {string} props.cardBg
 * @param {string} props.cardBorder
 * @param {string} props.mutedColor
 * @param {string} props.textColor
 * @param {string} props.fontFamily
 * @param {boolean} props.isDark
 * @param {string} [props.accent]
 * @param {(msg: string) => void} [props.onCopied]
 * @param {(hex: string, meta: object) => void} [props.onShadeClick]
 */
export default function ColorScaleGrid({
  baseHex,
  colorName: colorNameProp,
  emotionLabel,
  cardBg,
  cardBorder,
  mutedColor,
  textColor,
  fontFamily,
  isDark,
  accent = "#6366F1",
  onCopied,
  onShadeClick,
}) {
  const [exportFormat, setExportFormat] = useState("tailwind"); // tailwind | css
  const [copiedKey, setCopiedKey] = useState(null); // 'code' | shade key

  const colorName = useMemo(
    () => scaleColorName(colorNameProp || emotionLabel || "brand"),
    [colorNameProp, emotionLabel],
  );

  const scale = useMemo(() => generateColorScale(baseHex), [baseHex]);
  const meta = useMemo(() => generateColorScaleMeta(baseHex), [baseHex]);

  const codeSnippet = useMemo(() => {
    if (exportFormat === "css") {
      return formatCssScaleVariables(scale, colorName);
    }
    return formatTailwindScaleConfig(scale, {
      colorName,
      comment: `SeeUI · ${emotionLabel || colorName} emotion scale (500 = ${String(baseHex || "").toUpperCase()})`,
    });
  }, [exportFormat, scale, colorName, emotionLabel, baseHex]);

  const flashCopied = useCallback(
    (key, label) => {
      setCopiedKey(key);
      onCopied?.(label);
      window.setTimeout(() => {
        setCopiedKey((cur) => (cur === key ? null : cur));
      }, 1600);
    },
    [onCopied],
  );

  const handleCopyCode = useCallback(async () => {
    const ok = await copyToClipboard(codeSnippet);
    if (ok) flashCopied("code", "Tailwind scale");
  }, [codeSnippet, flashCopied]);

  const handleCopyShade = useCallback(
    async (hex, stop) => {
      const ok = await copyToClipboard(hex);
      if (ok) flashCopied(String(stop), `${stop} · ${hex}`);
      onShadeClick?.(hex, { stop, scale });
    },
    [flashCopied, onShadeClick, scale],
  );

  const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const codeBg = isDark ? "rgba(8,10,18,0.92)" : "#0F172A";
  const codeBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.12)";

  return (
    <section
      id="scale"
      className="scroll-mt-8 rounded-2xl p-5 sm:p-6 transition-colors duration-500"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div
            className="text-[9.5px] font-bold uppercase tracking-widest"
            style={{ color: mutedColor, fontFamily }}
          >
            Design system · Tailwind 50–950
          </div>
          <h2
            className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl"
            style={{ color: textColor, fontFamily }}
          >
            Full Color Scale Generator
          </h2>
          <p
            className="mt-1.5 text-[12px] leading-relaxed max-w-xl"
            style={{ color: mutedColor, fontFamily }}
          >
            Primary emotion color locked as{" "}
            <span className="font-bold" style={{ color: textColor }}>
              500
            </span>
            . Lighter stops lift lightness toward 98% with softer saturation;
            darker stops deepen toward 10% while keeping chroma rich.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{
              backgroundColor: chipBg,
              border: `1px solid ${cardBorder}`,
              color: textColor,
              fontFamily,
            }}
          >
            <span
              className="h-3.5 w-3.5 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: scale["500"] }}
              aria-hidden
            />
            Base 500 · {scale["500"]}
          </div>
          {emotionLabel ? (
            <div
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}44`,
                fontFamily,
              }}
            >
              {emotionLabel}
            </div>
          ) : null}
        </div>
      </div>

      {/* Tailwind-style horizontal grid */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${cardBorder}` }}
      >
        <div className="grid grid-cols-11 min-w-0">
          {meta.map((cell) => {
            const isCopied = copiedKey === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => handleCopyShade(cell.hex, cell.stop)}
                title={`Copy ${cell.stop}: ${cell.hex}`}
                className="group relative flex flex-col justify-between min-h-[7.5rem] sm:min-h-[8.5rem] px-1.5 py-2.5 sm:px-2 sm:py-3 text-left transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/50"
                style={{
                  backgroundColor: cell.hex,
                  boxShadow: cell.isBase
                    ? `inset 0 0 0 2px ${cell.ink === "#FFFFFF" ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.35)"}`
                    : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-0.5">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold tabular-nums"
                    style={{ color: cell.ink, fontFamily }}
                  >
                    {cell.stop}
                  </span>
                  {cell.isBase ? (
                    <span
                      className="hidden sm:inline text-[8px] font-black uppercase tracking-wider opacity-80"
                      style={{ color: cell.ink }}
                    >
                      base
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto">
                  <span
                    className="block text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide opacity-80"
                    style={{ color: cell.ink, fontFamily }}
                  >
                    {isCopied ? "Copied" : colorName}
                  </span>
                  <span
                    className="block text-[9px] sm:text-[10px] font-mono font-medium mt-0.5 break-all leading-tight"
                    style={{ color: cell.ink, opacity: 0.95 }}
                  >
                    {isCopied ? "✓" : cell.hex}
                  </span>
                </div>

                {/* Hover hint */}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor:
                      cell.ink === "#FFFFFF"
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(15,23,42,0.35)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <p
        className="mt-2 text-[10px]"
        style={{ color: mutedColor, fontFamily }}
      >
        Click any shade to copy its HEX · Text ink auto-switches for WCAG readability
      </p>

      {/* Compact list (mobile-friendly detail) */}
      <div className="mt-4 hidden sm:grid grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-3">
        {meta.map((cell) => (
          <button
            key={`row-${cell.key}`}
            type="button"
            onClick={() => handleCopyShade(cell.hex, cell.stop)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:opacity-90"
            style={{
              backgroundColor: chipBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <span
              className="h-7 w-7 shrink-0 rounded-md shadow-sm"
              style={{
                backgroundColor: cell.hex,
                boxShadow: `inset 0 0 0 1px ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
              }}
            />
            <span
              className="w-8 text-[11px] font-bold tabular-nums"
              style={{ color: textColor, fontFamily }}
            >
              {cell.stop}
            </span>
            <span
              className="flex-1 font-mono text-[11px]"
              style={{ color: mutedColor }}
            >
              {cell.hex}
            </span>
            {cell.isBase ? (
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: accent }}
              >
                500
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Export code block */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <div
              className="text-[9.5px] font-bold uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily }}
            >
              Export
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: textColor, fontFamily }}
            >
              Tailwind config snippet
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="inline-flex rounded-full p-0.5"
              style={{
                backgroundColor: chipBg,
                border: `1px solid ${cardBorder}`,
              }}
            >
              {[
                { id: "tailwind", label: "tailwind.config" },
                { id: "css", label: "CSS vars" },
              ].map((opt) => {
                const active = exportFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExportFormat(opt.id)}
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: active ? accent : "transparent",
                      color: active ? "#FFFFFF" : mutedColor,
                      fontFamily,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all active:scale-95"
              style={{
                backgroundColor: accent,
                color: "#FFFFFF",
                fontFamily,
                boxShadow: `0 4px 16px ${accent}44`,
              }}
            >
              {copiedKey === "code" ? (
                <>
                  <CheckIcon />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundColor: codeBg,
            border: `1px solid ${codeBorder}`,
            boxShadow: isDark
              ? "0 12px 40px rgba(0,0,0,0.35)"
              : "0 12px 40px rgba(15,23,42,0.12)",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span
                className="ml-2 text-[10px] font-medium"
                style={{ color: "rgba(226,232,240,0.55)", fontFamily }}
              >
                {exportFormat === "css"
                  ? `tokens · --color-${colorName}-*`
                  : `theme.extend.colors.${colorName}`}
              </span>
            </div>
            <span
              className="text-[9px] font-mono"
              style={{ color: "rgba(148,163,184,0.8)" }}
            >
              {colorName} · 11 shades
            </span>
          </div>

          <pre
            className="overflow-x-auto p-4 text-[11px] sm:text-[12px] leading-relaxed font-mono"
            style={{ color: "#E2E8F0", margin: 0 }}
          >
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
