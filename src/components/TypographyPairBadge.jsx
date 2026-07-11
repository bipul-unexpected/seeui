/**
 * Elegant badge showing active emotion typography pair.
 * Font names link to Google Fonts specimens.
 */

import { formatTypographyLabel } from "../data/emotionTypography";

/**
 * @param {object} props
 * @param {import('../data/emotionTypography').EmotionTypePair} props.pair
 * @param {string} [props.mutedColor]
 * @param {string} [props.textColor]
 * @param {string} [props.cardBorder]
 * @param {string} [props.fontFamily] — UI chrome font (not the pair)
 * @param {boolean} [props.isDark]
 * @param {string} [props.accent]
 * @param {'compact'|'full'} [props.variant]
 */
export default function TypographyPairBadge({
  pair,
  mutedColor = "#888",
  textColor = "#E8E8F0",
  cardBorder = "rgba(255,255,255,0.1)",
  fontFamily,
  isDark = true,
  accent = "#818CF8",
  variant = "full",
}) {
  if (!pair) return null;

  const label = formatTypographyLabel(pair);

  if (variant === "compact") {
    return (
      <div
        className="inline-flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px]"
        style={{
          background: isDark
            ? "rgba(99,102,241,0.12)"
            : "rgba(99,102,241,0.08)",
          border: `1px solid ${isDark ? "rgba(129,140,248,0.3)" : "rgba(99,102,241,0.25)"}`,
          fontFamily,
          color: mutedColor,
        }}
        title={pair.psychology}
      >
        <span className="font-black uppercase tracking-widest text-[8px]" style={{ color: accent }}>
          Type
        </span>
        <a
          href={pair.heading.googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline-offset-2 hover:underline transition-colors"
          style={{ color: textColor, fontFamily: pair.heading.family }}
        >
          {pair.heading.name}
        </a>
        <span style={{ opacity: 0.4 }}>+</span>
        <a
          href={pair.body.googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline-offset-2 hover:underline transition-colors"
          style={{ color: textColor, fontFamily: pair.body.family }}
        >
          {pair.body.name}
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-3 py-2.5 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))"
          : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))",
        border: `1px solid ${isDark ? "rgba(129,140,248,0.28)" : "rgba(99,102,241,0.2)"}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="text-[8.5px] font-black uppercase tracking-widest"
          style={{ color: accent, fontFamily }}
        >
          Typography · {pair.label}
        </span>
      </div>

      <p
        className="text-[11px] leading-snug mb-2"
        style={{ color: mutedColor, fontFamily }}
      >
        <span className="sr-only">{label}. </span>
        {pair.psychology}
      </p>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[8px] font-black uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: mutedColor,
              fontFamily,
            }}
          >
            H
          </span>
          <a
            href={pair.heading.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-bold truncate underline-offset-2 hover:underline transition-all"
            style={{
              color: textColor,
              fontFamily: pair.heading.family,
            }}
            title={`Open ${pair.heading.name} on Google Fonts`}
          >
            {pair.heading.name}
          </a>
          <span className="text-[9px] shrink-0" style={{ color: mutedColor, fontFamily }}>
            Heading
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[8px] font-black uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: mutedColor,
              fontFamily,
            }}
          >
            B
          </span>
          <a
            href={pair.body.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold truncate underline-offset-2 hover:underline transition-all"
            style={{
              color: textColor,
              fontFamily: pair.body.family,
            }}
            title={`Open ${pair.body.name} on Google Fonts`}
          >
            {pair.body.name}
          </a>
          <span className="text-[9px] shrink-0" style={{ color: mutedColor, fontFamily }}>
            Body
          </span>
        </div>
      </div>
    </div>
  );
}
