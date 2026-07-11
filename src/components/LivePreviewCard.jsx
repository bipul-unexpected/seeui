/**
 * Live Preview card — dark/light toggle, WCAG, export, emotion typography.
 * Typography pair applies only inside this preview (heading vs body).
 */

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { adaptPaletteToMode, isDarkBackground } from "../utils/paletteMode";
import { useDynamicFonts } from "../utils/useDynamicFonts";
import { getTypographyForEmotion } from "../data/emotionTypography";
import WcagBadge from "./WcagBadge";
import ExportPaletteMenu from "./ExportPaletteMenu";
import TypographyPairBadge from "./TypographyPairBadge";

/**
 * @param {object} props
 * @param {string} props.background
 * @param {string} props.text
 * @param {string} [props.accent]
 * @param {string|null} [props.emotionId]
 * @param {import('../data/emotionTypography').EmotionTypePair} [props.typePair] — if parent already loaded fonts
 * @param {string} props.cardBg
 * @param {string} props.cardBorder
 * @param {string} props.mutedColor
 * @param {string} props.fontFamily — chrome UI font
 * @param {boolean} props.isDark
 * @param {(msg: string) => void} [props.onCopied]
 * @param {(palette: object) => void} [props.onApplyPreview]
 */
export default function LivePreviewCard({
  background,
  text,
  accent = "#6366F1",
  emotionId = "trust",
  typePair: typePairProp,
  cardBg,
  cardBorder,
  mutedColor,
  fontFamily,
  isDark,
  onCopied,
  onApplyPreview,
}) {
  const [previewMode, setPreviewMode] = useState(() =>
    isDarkBackground(background) ? "dark" : "light",
  );
  const lastSourceRef = useRef(`${background}|${text}`);

  // Load fonts here only if parent did not pass a pair (avoids double <link>)
  const hookPair = useDynamicFonts(emotionId, {
    enabled: !typePairProp,
  });
  const typePair =
    typePairProp || hookPair || getTypographyForEmotion(emotionId);

  useEffect(() => {
    const key = `${background}|${text}`;
    if (key === lastSourceRef.current) return;
    lastSourceRef.current = key;
    setPreviewMode(isDarkBackground(background) ? "dark" : "light");
  }, [background, text]);

  const preview = useMemo(
    () => adaptPaletteToMode({ background, text, accent }, previewMode),
    [background, text, accent, previewMode],
  );

  const exportPayload = useMemo(
    () => ({
      ...preview,
      emotion: emotionId,
      typography: typePair,
    }),
    [preview, emotionId, typePair],
  );

  const toggleMode = useCallback(() => {
    setPreviewMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  const handleApplyToPage = useCallback(() => {
    onApplyPreview?.({
      background: preview.background,
      text: preview.text,
      accent: preview.accent,
      emotion: emotionId,
    });
  }, [onApplyPreview, preview, emotionId]);

  const headingStyle = {
    color: preview.text,
    fontFamily: typePair.heading.family,
    transition: "color 0.5s ease, font-family 0.35s ease",
  };
  const bodyStyle = {
    color: preview.text,
    fontFamily: typePair.body.family,
    transition: "color 0.5s ease, font-family 0.35s ease",
  };

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 transition-colors duration-500 flex flex-col"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <span
          className="text-[9.5px] uppercase tracking-widest"
          style={{ color: mutedColor, fontFamily, fontWeight: 700 }}
        >
          Live preview
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)",
              color: mutedColor,
              border: `1px solid ${cardBorder}`,
            }}
            title={
              previewMode === "dark"
                ? "Switch preview to light"
                : "Switch preview to dark"
            }
            aria-label="Toggle preview dark/light mode"
          >
            {previewMode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <ExportPaletteMenu
            palette={exportPayload}
            onCopied={onCopied}
            fontFamily={fontFamily}
            buttonBg={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}
            buttonColor={mutedColor}
            borderColor={cardBorder}
            isDark={isDark}
            mutedColor={mutedColor}
            cardBorder={cardBorder}
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <WcagBadge
          textColor={preview.text}
          backgroundColor={preview.background}
          fontFamily={fontFamily}
        />
      </div>

      {/* Preview stage */}
      <div
        className="rounded-xl p-4 transition-colors duration-500 flex-1 flex flex-col gap-3"
        style={{
          backgroundColor: preview.background,
          border: `1px solid ${cardBorder}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="inline-flex self-start text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${preview.accent}28`,
            color: preview.accent,
            border: `1px solid ${preview.accent}55`,
            fontFamily: typePair.body.family,
          }}
        >
          {typePair.label} · {previewMode}
        </span>

        {/* Heading — emotion heading font */}
        <h3
          className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight"
          style={{ ...headingStyle, fontWeight: 700 }}
          key={`h-${typePair.heading.name}`}
        >
          Design that feels right.
        </h3>

        {/* Subheading / body — emotion body font */}
        <p
          className="text-[12px] sm:text-[13px] leading-relaxed"
          style={{ ...bodyStyle, opacity: 0.78, fontWeight: 400 }}
          key={`b-${typePair.body.name}`}
        >
          Headings use <strong style={{ fontFamily: typePair.heading.family }}>{typePair.heading.name}</strong>
          {" · "}
          body uses <strong style={{ fontFamily: typePair.body.family }}>{typePair.body.name}</strong>.
          {" "}Pick a gallery emotion to restyle colors + type together.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <button
            type="button"
            className="rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all duration-300"
            style={{
              backgroundColor: preview.accent,
              color: preview.background,
              boxShadow: `0 4px 14px ${preview.accent}44`,
              fontFamily: typePair.body.family,
              transition: "background-color 0.4s ease, font-family 0.35s ease",
            }}
          >
            Get started
          </button>
          <button
            type="button"
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300"
            style={{
              color: preview.text,
              border: `1px solid ${preview.text}40`,
              fontFamily: typePair.body.family,
              background: "transparent",
            }}
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Typography info badge */}
      <div className="mt-3">
        <TypographyPairBadge
          pair={typePair}
          mutedColor={mutedColor}
          textColor={isDark ? "#E8E8F0" : "#1E1B4B"}
          cardBorder={cardBorder}
          fontFamily={fontFamily}
          isDark={isDark}
          accent={isDark ? "#A5B4FC" : "#4F46E5"}
        />
      </div>

      {/* Swatches */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["BG", preview.background],
          ["Text", preview.text],
          ["Accent", preview.accent],
        ].map(([label, hex]) => (
          <div
            key={label}
            className="rounded-lg p-2 text-center"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-full h-5 rounded mb-1.5"
              style={{ backgroundColor: hex }}
            />
            <div
              className="text-[8px] uppercase tracking-wider"
              style={{ color: mutedColor, fontFamily }}
            >
              {label}
            </div>
            <div
              className="text-[9px] font-mono font-bold truncate"
              style={{ color: isDark ? "#D0D0D8" : "#333" }}
            >
              {hex}
            </div>
          </div>
        ))}
      </div>

      {typeof onApplyPreview === "function" && (
        <button
          type="button"
          onClick={handleApplyToPage}
          className="mt-3 w-full rounded-xl py-2 text-[11px] font-bold transition-all active:scale-[0.99]"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.2))"
              : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.1))",
            color: isDark ? "#C7D2FE" : "#4F46E5",
            border: "1px solid rgba(99,102,241,0.35)",
            fontFamily,
          }}
        >
          Apply preview to page
        </button>
      )}
    </div>
  );
}
