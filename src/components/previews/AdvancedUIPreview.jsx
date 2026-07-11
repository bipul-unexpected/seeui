/**
 * Advanced UI Component Preview — parent shell with tab navigation.
 * Switches between Hero, Dashboard, Product Card, and Login Form previews
 * using the live psychology palette + emotion typography.
 */

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Moon, Sun, Layout, BarChart3, ShoppingBag, LogIn } from "lucide-react";
import { adaptPaletteToMode, isDarkBackground } from "../../utils/paletteMode";
import { useDynamicFonts } from "../../utils/useDynamicFonts";
import { getTypographyForEmotion } from "../../data/emotionTypography";
import { PREVIEW_PSYCHOLOGY } from "../../data/psychologySections";
import { buildPreviewTheme } from "./previewTheme";
import HeroPreview from "./HeroPreview";
import DashboardPreview from "./DashboardPreview";
import ProductCardPreview from "./ProductCardPreview";
import LoginFormPreview from "./LoginFormPreview";
import WcagBadge from "../WcagBadge";
import ExportPaletteMenu from "../ExportPaletteMenu";
import TypographyPairBadge from "../TypographyPairBadge";

const ICONS = {
  hero: Layout,
  dashboard: BarChart3,
  product: ShoppingBag,
  login: LogIn,
};

export const PREVIEW_TABS = PREVIEW_PSYCHOLOGY.map((p) => ({
  ...p,
  icon: ICONS[p.id] || Layout,
}));

/**
 * @param {object} props
 * @param {string} props.background
 * @param {string} props.text
 * @param {string} [props.accent]
 * @param {string|null} [props.emotionId]
 * @param {import('../../data/emotionTypography').EmotionTypePair} [props.typePair]
 * @param {string} props.cardBg
 * @param {string} props.cardBorder
 * @param {string} props.mutedColor
 * @param {string} props.fontFamily
 * @param {boolean} props.isDark
 * @param {(msg: string) => void} [props.onCopied]
 * @param {(palette: object) => void} [props.onApplyPreview]
 * @param {string} [props.controlledTab] — controlled active preview tab
 * @param {(id: string) => void} [props.onTabChange]
 */
export default function AdvancedUIPreview({
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
  controlledTab,
  onTabChange,
}) {
  const [internalTab, setInternalTab] = useState("hero");
  const activePreview =
    controlledTab !== undefined && controlledTab !== null
      ? controlledTab
      : internalTab;

  const setActivePreview = useCallback(
    (id) => {
      if (onTabChange) onTabChange(id);
      else setInternalTab(id);
    },
    [onTabChange],
  );

  const [previewMode, setPreviewMode] = useState(() =>
    isDarkBackground(background) ? "dark" : "light",
  );
  const lastSourceRef = useRef(`${background}|${text}`);

  const hookPair = useDynamicFonts(emotionId, { enabled: !typePairProp });
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

  const theme = useMemo(
    () =>
      buildPreviewTheme({
        background: preview.background,
        text: preview.text,
        highlight: preview.accent,
        headingFont: typePair.heading.family,
        bodyFont: typePair.body.family,
      }),
    [preview, typePair],
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

  const activeTabMeta =
    PREVIEW_TABS.find((t) => t.id === activePreview) || PREVIEW_TABS[0];
  const ActiveIcon = activeTabMeta?.icon || Layout;

  return (
    <section
      className="mt-3 rounded-2xl p-4 sm:p-6 transition-colors duration-500"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[9.5px] font-bold uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily }}
            >
              Advanced UI Preview
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{
                background: isDark
                  ? "rgba(99,102,241,0.18)"
                  : "rgba(99,102,241,0.1)",
                color: isDark ? "#A5B4FC" : "#4F46E5",
                border: "1px solid rgba(99,102,241,0.3)",
                fontFamily,
              }}
            >
              Live components
            </span>
          </div>
          <p
            className="mt-1 max-w-md text-xs leading-relaxed"
            style={{ color: mutedColor, fontFamily }}
          >
            Switch real-world UI patterns to stress-test your emotion palette
            and typography.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <WcagBadge
            textColor={preview.text}
            backgroundColor={preview.background}
            fontFamily={fontFamily}
          />
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95"
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
            aria-label="Toggle preview dark/light"
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
          />
        </div>
      </div>

      {/* Layout: sidebar tabs + stage */}
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Tab rail — horizontal on mobile, vertical sidebar on desktop */}
        <nav
          className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 lg:w-[200px] lg:flex-col lg:overflow-visible lg:pb-0"
          style={{ scrollbarWidth: "thin" }}
          aria-label="Preview components"
        >
          {PREVIEW_TABS.map((tab) => {
            const active = activePreview === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePreview(tab.id)}
                className="flex min-w-[140px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98] lg:min-w-0"
                style={{
                  background: active
                    ? isDark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(168,85,247,0.18))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.1))"
                    : isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                  border: active
                    ? "1px solid rgba(129,140,248,0.45)"
                    : `1px solid ${cardBorder}`,
                  boxShadow: active
                    ? "0 4px 16px rgba(99,102,241,0.15)"
                    : "none",
                  color: active
                    ? isDark
                      ? "#E0E7FF"
                      : "#312E81"
                    : mutedColor,
                  fontFamily,
                }}
                aria-current={active ? "true" : undefined}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #6366F1, #A855F7)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    color: active ? "#FFF" : mutedColor,
                  }}
                >
                  <Icon size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold leading-tight">
                    {tab.short}
                  </span>
                  <span
                    className="mt-0.5 block text-[9px] leading-tight"
                    style={{
                      color: active
                        ? isDark
                          ? "rgba(224,231,255,0.65)"
                          : "rgba(49,46,129,0.65)"
                        : mutedColor,
                      opacity: 0.9,
                    }}
                  >
                    {tab.principle || tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Stage */}
        <div className="min-w-0 flex-1">
          <div
            className="mb-2 flex flex-wrap items-center gap-2 px-0.5"
            style={{ color: mutedColor, fontFamily }}
          >
            <ActiveIcon size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {activeTabMeta.label}
            </span>
            <span className="text-[10px] opacity-50">·</span>
            <span className="text-[10px] opacity-70">
              {activeTabMeta.principle || previewMode}
            </span>
          </div>
          {activeTabMeta.psychology ? (
            <p
              className="mb-2 text-[10px] leading-relaxed px-0.5"
              style={{ color: mutedColor, fontFamily, maxWidth: 520 }}
            >
              {activeTabMeta.psychology}
            </p>
          ) : null}

          <div
            className="overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              border: `1px solid ${cardBorder}`,
              boxShadow: isDark
                ? "0 12px 40px rgba(0,0,0,0.35)"
                : "0 12px 40px rgba(0,0,0,0.08)",
            }}
          >
            {activePreview === "hero" && <HeroPreview theme={theme} />}
            {activePreview === "dashboard" && (
              <DashboardPreview theme={theme} />
            )}
            {activePreview === "product" && (
              <ProductCardPreview theme={theme} />
            )}
            {activePreview === "login" && <LoginFormPreview theme={theme} />}
          </div>

          {/* Typography badge under stage */}
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

          {/* Palette chips + apply */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              ["BG", theme.background],
              ["Text", theme.text],
              ["Accent", theme.highlight],
            ].map(([label, hex]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full px-2.5 py-1"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: hex,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                  }}
                />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: mutedColor, fontFamily }}
                >
                  {label}
                </span>
                <span
                  className="text-[9px] font-mono font-semibold"
                  style={{ color: isDark ? "#D0D0D8" : "#333" }}
                >
                  {hex}
                </span>
              </div>
            ))}

            {typeof onApplyPreview === "function" && (
              <button
                type="button"
                onClick={handleApplyToPage}
                className="ml-auto rounded-full px-4 py-1.5 text-[10px] font-bold transition-all active:scale-95"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.22))"
                    : "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.1))",
                  color: isDark ? "#C7D2FE" : "#4F46E5",
                  border: "1px solid rgba(99,102,241,0.4)",
                  fontFamily,
                }}
              >
                Apply preview to page
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
