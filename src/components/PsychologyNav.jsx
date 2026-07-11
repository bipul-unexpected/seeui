/**
 * Psychology-aware section navigation for SeeUI.
 * Links follow a design journey: Attention → Emotion → Memory → Decision.
 */

import { Link, useLocation } from "react-router";
import { SITE_SECTIONS } from "../data/psychologySections";

/**
 * @param {object} props
 * @param {string} [props.textColor]
 * @param {string} [props.mutedColor]
 * @param {string} [props.chipBg]
 * @param {string} [props.cardBorder]
 * @param {string} [props.fontFamily]
 * @param {boolean} [props.isDark]
 * @param {string} [props.accent]
 * @param {'compact'|'full'} [props.variant]
 * @param {string} [props.activeId] — force-highlight a section id
 */
export default function PsychologyNav({
  textColor = "#E8E8F0",
  mutedColor = "#888",
  chipBg = "rgba(255,255,255,0.06)",
  cardBorder = "rgba(255,255,255,0.1)",
  fontFamily,
  isDark = true,
  accent = "#818CF8",
  variant = "compact",
  activeId,
}) {
  const location = useLocation();
  const hash =
    typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";

  const isActive = (section) => {
    if (activeId) return activeId === section.id;
    if (section.kind === "page") {
      return location.pathname === section.href || location.pathname.startsWith(section.href + "/");
    }
    // anchor on home
    if (location.pathname !== "/" && location.pathname !== "") return false;
    const anchor = section.href.split("#")[1];
    return hash === anchor || (!hash && section.id === "workspace");
  };

  if (variant === "full") {
    return (
      <nav
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Psychology sections"
      >
        {SITE_SECTIONS.map((section, i) => {
          const active = isActive(section);
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: active ? accent : mutedColor, fontFamily }}
                >
                  {String(i + 1).padStart(2, "0")} · {section.short}
                </span>
              </div>
              <div
                className="text-[13px] font-bold leading-snug"
                style={{ color: textColor, fontFamily }}
              >
                {section.label}
              </div>
              <p
                className="mt-1 text-[10px] leading-relaxed"
                style={{ color: mutedColor, fontFamily }}
              >
                {section.psychology}
              </p>
            </>
          );

          const style = {
            background: active
              ? isDark
                ? "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.14))"
                : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))"
              : chipBg,
            border: active
              ? "1px solid rgba(129,140,248,0.45)"
              : `1px solid ${cardBorder}`,
            boxShadow: active ? "0 4px 16px rgba(99,102,241,0.15)" : "none",
          };

          if (section.kind === "page") {
            return (
              <Link
                key={section.id}
                to={section.href}
                className="rounded-2xl p-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={style}
              >
                {inner}
              </Link>
            );
          }

          return (
            <a
              key={section.id}
              href={section.href}
              className="rounded-2xl p-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={style}
            >
              {inner}
            </a>
          );
        })}
      </nav>
    );
  }

  // Compact pill row (navbar)
  return (
    <nav
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Psychology sections"
    >
      {SITE_SECTIONS.map((section) => {
        const active = isActive(section);
        const className =
          "rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-200 active:scale-95 whitespace-nowrap";
        const style = {
          background: active
            ? isDark
              ? "rgba(99,102,241,0.28)"
              : "rgba(99,102,241,0.14)"
            : chipBg,
          color: active ? (isDark ? "#E0E7FF" : "#3730A3") : mutedColor,
          border: active
            ? "1px solid rgba(129,140,248,0.45)"
            : `1px solid ${cardBorder}`,
          fontFamily,
        };

        if (section.kind === "page") {
          return (
            <Link
              key={section.id}
              to={section.href}
              className={className}
              style={style}
              title={section.psychology}
            >
              {section.short}
            </Link>
          );
        }

        return (
          <a
            key={section.id}
            href={section.href}
            className={className}
            style={style}
            title={section.psychology}
          >
            {section.short}
          </a>
        );
      })}
    </nav>
  );
}
