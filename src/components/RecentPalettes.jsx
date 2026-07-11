/**
 * Recent / History palettes — shared across all SeeUI pages.
 * Click to re-apply to workspace.
 */

import { Trash2, History } from "lucide-react";
import { SOURCE_LABELS } from "../utils/paletteHistoryStore";

/**
 * @param {object} props
 */
export default function RecentPalettes({
  recent,
  onApply,
  onClear,
  onRemove,
  cardBg,
  cardBorder,
  mutedColor,
  textColor,
  fontFamily,
  isDark,
  activeKey,
  title = "History",
  emptyHint = "Palettes you apply or generate appear here (saved in this browser — up to 20).",
}) {
  if (!recent?.length) {
    return (
      <section
        className="mt-3 rounded-2xl p-5 sm:p-6 transition-colors duration-500"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2">
          <History size={14} style={{ color: mutedColor }} />
          <span
            className="text-[9.5px] font-black uppercase tracking-widest"
            style={{ color: mutedColor, fontFamily }}
          >
            {title}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: mutedColor, fontFamily }}>
          {emptyHint}
        </p>
      </section>
    );
  }

  return (
    <section
      className="mt-3 rounded-2xl p-5 sm:p-6 transition-colors duration-500"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History size={14} style={{ color: mutedColor }} />
          <span
            className="text-[9.5px] font-black uppercase tracking-widest"
            style={{ color: mutedColor, fontFamily }}
          >
            {title}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{
              background: isDark
                ? "rgba(99,102,241,0.18)"
                : "rgba(99,102,241,0.1)",
              color: isDark ? "#A5B4FC" : "#4F46E5",
              border: "1px solid rgba(99,102,241,0.28)",
              fontFamily,
            }}
          >
            {recent.length}/20
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95"
          style={{
            color: mutedColor,
            border: `1px solid ${cardBorder}`,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            fontFamily,
          }}
        >
          <Trash2 size={11} />
          Clear
        </button>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {recent.map((p) => {
          const key = `${p.background}|${p.text}|${p.highlight || p.accent}`;
          const active = activeKey === key;
          const source =
            SOURCE_LABELS[p.source] || p.source || "Workspace";
          return (
            <button
              key={p.id || key}
              type="button"
              onClick={() =>
                onApply({
                  background: p.background,
                  text: p.text,
                  accent: p.highlight || p.accent,
                  highlight: p.highlight || p.accent,
                  label: p.label,
                  id: p.id,
                  emotion: p.emotion,
                  mode: p.mode,
                  source: "recent",
                })
              }
              className="group relative w-[132px] shrink-0 overflow-hidden rounded-xl text-left transition-all active:scale-[0.98]"
              style={{
                border: active
                  ? "2px solid #818CF8"
                  : `1px solid ${cardBorder}`,
                boxShadow: active
                  ? "0 6px 20px rgba(99,102,241,0.25)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                background: isDark
                  ? "rgba(0,0,0,0.25)"
                  : "rgba(255,255,255,0.6)",
              }}
              title={`${p.label || "Palette"} · ${source} — click to apply`}
            >
              <div className="flex h-11">
                <div
                  className="flex-[2]"
                  style={{ backgroundColor: p.background }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: p.text }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: p.highlight || p.accent }}
                />
              </div>
              <div className="px-2 py-1.5">
                <div
                  className="truncate text-[10px] font-bold"
                  style={{ color: textColor, fontFamily }}
                >
                  {p.label || "Palette"}
                </div>
                <div
                  className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-wide"
                  style={{ color: mutedColor, fontFamily }}
                >
                  {source}
                  {p.emotion ? ` · ${p.emotion}` : ""}
                </div>
              </div>
              {onRemove && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(p.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      onRemove(p.id);
                    }
                  }}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full group-hover:flex"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    color: "#FCA5A5",
                    fontSize: 12,
                  }}
                  title="Remove"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
