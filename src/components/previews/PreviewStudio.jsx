/**
 * Premium Preview Studio — full customization of emotion themes + UI patterns.
 * Clean three-zone layout: Templates · Controls · Live Stage
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Layout,
  BarChart3,
  ShoppingBag,
  LogIn,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  THEME_TEMPLATES,
  RADIUS_OPTIONS,
  DENSITY_OPTIONS,
  SHADOW_OPTIONS,
  findTemplate,
} from "../../data/themeTemplates";
import { PREVIEW_PSYCHOLOGY } from "../../data/psychologySections";
import { getTypographyForEmotion } from "../../data/emotionTypography";
import { useDynamicFonts } from "../../utils/useDynamicFonts";
import { adaptPaletteToMode, isDarkBackground } from "../../utils/paletteMode";
import { getWcagReport } from "../../utils/wcagContrast";
import { buildPreviewTheme } from "./previewTheme";
import HeroPreview from "./HeroPreview";
import DashboardPreview from "./DashboardPreview";
import ProductCardPreview from "./ProductCardPreview";
import LoginFormPreview from "./LoginFormPreview";
import ExportPaletteMenu from "../ExportPaletteMenu";
import WcagBadge from "../WcagBadge";

const PATTERN_ICONS = {
  hero: Layout,
  dashboard: BarChart3,
  product: ShoppingBag,
  login: LogIn,
};

const PATTERNS = PREVIEW_PSYCHOLOGY.map((p) => ({
  ...p,
  icon: PATTERN_ICONS[p.id] || Layout,
}));

function ColorField({ label, value, onChange, textColor, muted, border, fontFamily }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[9px] font-black uppercase tracking-widest"
        style={{ color: muted, fontFamily }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value?.slice(0, 7) || "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          style={{ border: `1px solid ${border}` }}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v && !v.startsWith("#")) v = `#${v}`;
            onChange(v.toUpperCase());
          }}
          className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-[11px] font-mono font-semibold outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: textColor,
            border: `1px solid ${border}`,
            fontFamily,
          }}
          spellCheck={false}
        />
      </div>
    </label>
  );
}

function Segmented({ options, value, onChange, muted, border, accent, textColor, fontFamily }) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl p-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${border}`,
      }}
    >
      {options.map((opt) => {
        const id = opt.id || opt;
        const label = opt.label || opt;
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-all active:scale-[0.98]"
            style={{
              background: active ? `${accent}28` : "transparent",
              color: active ? textColor : muted,
              border: active ? `1px solid ${accent}55` : "1px solid transparent",
              fontFamily,
              minWidth: 56,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * @param {object} props
 */
export default function PreviewStudio({
  background: initialBg,
  text: initialText,
  accent: initialAccent,
  emotionId: initialEmotion = "trust",
  onChange,
  onCopied,
  onApplyWorkspace,
}) {
  const [background, setBackground] = useState(initialBg || "#0F172A");
  const [text, setText] = useState(initialText || "#F8FAFC");
  const [accent, setAccent] = useState(initialAccent || "#6366F1");
  const [emotion, setEmotion] = useState(initialEmotion || "trust");
  const [pattern, setPattern] = useState("hero");
  const [radius, setRadius] = useState("lg");
  const [density, setDensity] = useState("comfortable");
  const [shadow, setShadow] = useState("soft");
  const [mode, setMode] = useState(() =>
    isDarkBackground(initialBg || "#0F172A") ? "dark" : "light",
  );
  const [templateId, setTemplateId] = useState(null);
  const [panel, setPanel] = useState("templates"); // templates | colors | shape | pattern
  const skipExternal = useRef(false);
  const lastExternal = useRef(
    `${initialBg}|${initialText}|${initialAccent}|${initialEmotion}`,
  );

  // Sync only when parent palette changes from outside (workspace), not our own pushes
  useEffect(() => {
    const key = `${initialBg}|${initialText}|${initialAccent}|${initialEmotion}`;
    if (key === lastExternal.current) return;
    if (skipExternal.current) {
      skipExternal.current = false;
      lastExternal.current = key;
      return;
    }
    lastExternal.current = key;
    if (initialBg) setBackground(initialBg);
    if (initialText) setText(initialText);
    if (initialAccent) setAccent(initialAccent);
    if (initialEmotion) setEmotion(initialEmotion);
  }, [initialBg, initialText, initialAccent, initialEmotion]);

  const typePair = useDynamicFonts(emotion);
  const pair = typePair || getTypographyForEmotion(emotion);

  // Stage uses raw tokens + mode shift only for display light/dark flip
  const adapted = useMemo(
    () => adaptPaletteToMode({ background, text, accent }, mode),
    [background, text, accent, mode],
  );

  const theme = useMemo(
    () =>
      buildPreviewTheme({
        background: adapted.background,
        text: adapted.text,
        highlight: adapted.accent,
        headingFont: pair.heading.family,
        bodyFont: pair.body.family,
        radius,
        density,
        shadow,
      }),
    [adapted, pair, radius, density, shadow],
  );

  const wcag = useMemo(
    () => getWcagReport(theme.text, theme.background),
    [theme.text, theme.background],
  );

  const pushParent = useCallback(
    (next = {}) => {
      const payload = {
        background: next.background ?? background,
        text: next.text ?? text,
        accent: next.accent ?? accent,
        emotion: next.emotion ?? emotion,
        radius: next.radius ?? radius,
        density: next.density ?? density,
        shadow: next.shadow ?? shadow,
        mode: next.mode ?? mode,
        pattern: next.pattern ?? pattern,
        templateId: next.templateId ?? templateId,
      };
      skipExternal.current = true;
      onChange?.(payload);
    },
    [
      background,
      text,
      accent,
      emotion,
      radius,
      density,
      shadow,
      mode,
      pattern,
      templateId,
      onChange,
    ],
  );

  const chromeIsDark = isDarkBackground(background);
  const chromeMuted = chromeIsDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(0,0,0,0.5)";
  const chromeBorder = chromeIsDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.08)";
  const chromeSurface = chromeIsDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.03)";
  const chromeText = chromeIsDark ? "#F8FAFC" : "#0F172A";
  const uiFont = "'Inter', system-ui, sans-serif";

  const applyTemplate = useCallback(
    (tpl) => {
      setTemplateId(tpl.id);
      setBackground(tpl.background);
      setText(tpl.text);
      setAccent(tpl.accent);
      setEmotion(tpl.emotion);
      setMode(tpl.mode);
      setRadius(tpl.radius);
      setDensity(tpl.density);
      setShadow(tpl.shadow);
      setPattern(tpl.previewTab || "hero");
      pushParent({
        background: tpl.background,
        text: tpl.text,
        accent: tpl.accent,
        emotion: tpl.emotion,
        radius: tpl.radius,
        density: tpl.density,
        shadow: tpl.shadow,
        mode: tpl.mode,
        pattern: tpl.previewTab || "hero",
        templateId: tpl.id,
      });
    },
    [pushParent],
  );

  const resetDefaults = useCallback(() => {
    const tpl = findTemplate("trust-saas") || THEME_TEMPLATES[0];
    applyTemplate(tpl);
  }, [applyTemplate]);

  const setBg = (v) => {
    setBackground(v);
    setTemplateId(null);
    pushParent({ background: v, templateId: null });
  };
  const setTx = (v) => {
    setText(v);
    setTemplateId(null);
    pushParent({ text: v, templateId: null });
  };
  const setAc = (v) => {
    setAccent(v);
    setTemplateId(null);
    pushParent({ accent: v, templateId: null });
  };

  const exportPayload = useMemo(
    () => ({
      background: adapted.background,
      text: adapted.text,
      accent: adapted.accent,
      emotion,
      typography: pair,
    }),
    [adapted, emotion, pair],
  );

  const PatternView = {
    hero: HeroPreview,
    dashboard: DashboardPreview,
    product: ProductCardPreview,
    login: LoginFormPreview,
  }[pattern] || HeroPreview;

  const panelTabs = [
    { id: "templates", label: "Themes" },
    { id: "colors", label: "Colors" },
    { id: "shape", label: "Shape" },
    { id: "pattern", label: "UI" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
      {/* ── Control column ─────────────────────────────────────────────── */}
      <aside
        className="w-full shrink-0 lg:w-[340px]"
        style={{ fontFamily: uiFont }}
      >
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: chromeIsDark
              ? "linear-gradient(165deg, rgba(28,28,36,0.95), rgba(14,14,20,0.98))"
              : "linear-gradient(165deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))",
            border: `1px solid ${chromeBorder}`,
            boxShadow: chromeIsDark
              ? "0 24px 64px rgba(0,0,0,0.45)"
              : "0 20px 50px rgba(0,0,0,0.08)",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: chromeBorder }}
          >
            <div>
              <div
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: accent }}
              >
                Customize
              </div>
              <div
                className="text-sm font-extrabold"
                style={{ color: chromeText }}
              >
                Design tokens
              </div>
            </div>
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{
                color: chromeMuted,
                border: `1px solid ${chromeBorder}`,
                background: chromeSurface,
              }}
              title="Reset to Trust SaaS"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          </div>

          {/* Sub-nav */}
          <div
            className="flex gap-1 border-b p-2"
            style={{ borderColor: chromeBorder }}
          >
            {panelTabs.map((t) => {
              const active = panel === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPanel(t.id)}
                  className="flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all"
                  style={{
                    background: active ? `${accent}30` : "transparent",
                    color: active ? chromeText : chromeMuted,
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

          <div
            className="max-h-[min(62vh,560px)] space-y-4 overflow-y-auto p-4"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* THEMES */}
            {panel === "templates" && (
              <div className="space-y-2">
                <p className="text-[11px] leading-relaxed" style={{ color: chromeMuted }}>
                  One-click professional systems. Each maps an emotion to colors,
                  type, radius, and density.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {THEME_TEMPLATES.map((tpl) => {
                    const active = templateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="rounded-xl p-3 text-left transition-all active:scale-[0.99]"
                        style={{
                          background: active
                            ? `${tpl.accent}18`
                            : chromeSurface,
                          border: active
                            ? `1.5px solid ${tpl.accent}`
                            : `1px solid ${chromeBorder}`,
                          boxShadow: active
                            ? `0 8px 24px ${tpl.accent}22`
                            : "none",
                        }}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {[tpl.background, tpl.text, tpl.accent].map(
                              (c, i) => (
                                <span
                                  key={i}
                                  className="h-4 w-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: c }}
                                />
                              ),
                            )}
                          </div>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                            style={{
                              background: `${tpl.accent}22`,
                              color: tpl.accent,
                            }}
                          >
                            {tpl.emotion}
                          </span>
                        </div>
                        <div
                          className="text-[12px] font-extrabold"
                          style={{ color: chromeText }}
                        >
                          {tpl.name}
                        </div>
                        <div
                          className="mt-0.5 text-[10px]"
                          style={{ color: chromeMuted }}
                        >
                          {tpl.tagline}
                        </div>
                        <div
                          className="mt-1.5 text-[9px] leading-snug"
                          style={{ color: chromeMuted }}
                        >
                          {tpl.bestFor}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLORS */}
            {panel === "colors" && (
              <div className="space-y-4">
                <p className="text-[11px] leading-relaxed" style={{ color: chromeMuted }}>
                  Fine-tune every core token. Preview updates live.
                </p>
                <ColorField
                  label="Background"
                  value={background}
                  onChange={setBg}
                  textColor={chromeText}
                  muted={chromeMuted}
                  border={chromeBorder}
                  fontFamily={uiFont}
                />
                <ColorField
                  label="Text"
                  value={text}
                  onChange={setTx}
                  textColor={chromeText}
                  muted={chromeMuted}
                  border={chromeBorder}
                  fontFamily={uiFont}
                />
                <ColorField
                  label="Accent / Highlight"
                  value={accent}
                  onChange={setAc}
                  textColor={chromeText}
                  muted={chromeMuted}
                  border={chromeBorder}
                  fontFamily={uiFont}
                />

                <div>
                  <div
                    className="mb-1.5 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Preview mode
                  </div>
                  <Segmented
                    options={[
                      { id: "dark", label: "Dark" },
                      { id: "light", label: "Light" },
                    ]}
                    value={mode}
                    onChange={(id) => {
                      setMode(id);
                      pushParent({ mode: id });
                    }}
                    muted={chromeMuted}
                    border={chromeBorder}
                    accent={accent}
                    textColor={chromeText}
                    fontFamily={uiFont}
                  />
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{
                    background: chromeSurface,
                    border: `1px solid ${chromeBorder}`,
                  }}
                >
                  <div
                    className="mb-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Contrast
                  </div>
                  <WcagBadge
                    textColor={theme.text}
                    backgroundColor={theme.background}
                    fontFamily={uiFont}
                    size="md"
                  />
                  <p
                    className="mt-2 text-[10px]"
                    style={{ color: chromeMuted }}
                  >
                    {wcag.label} · {wcag.ratioLabel} for body text on background.
                  </p>
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{
                    background: chromeSurface,
                    border: `1px solid ${chromeBorder}`,
                  }}
                >
                  <div
                    className="mb-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Typography · {pair.label}
                  </div>
                  <div
                    className="text-[13px] font-bold"
                    style={{ color: chromeText, fontFamily: pair.heading.family }}
                  >
                    {pair.heading.name}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: chromeMuted, fontFamily: pair.body.family }}
                  >
                    Body · {pair.body.name}
                  </div>
                  <p className="mt-1.5 text-[9px] leading-snug" style={{ color: chromeMuted }}>
                    {pair.psychology}
                  </p>
                </div>
              </div>
            )}

            {/* SHAPE */}
            {panel === "shape" && (
              <div className="space-y-4">
                <p className="text-[11px] leading-relaxed" style={{ color: chromeMuted }}>
                  Corners, spacing, and elevation — the “feel” beyond color.
                </p>
                <div>
                  <div
                    className="mb-1.5 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Corner radius
                  </div>
                  <Segmented
                    options={RADIUS_OPTIONS}
                    value={radius}
                    onChange={(id) => {
                      setRadius(id);
                      setTemplateId(null);
                      pushParent({ radius: id, templateId: null });
                    }}
                    muted={chromeMuted}
                    border={chromeBorder}
                    accent={accent}
                    textColor={chromeText}
                    fontFamily={uiFont}
                  />
                </div>
                <div>
                  <div
                    className="mb-1.5 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Density
                  </div>
                  <Segmented
                    options={DENSITY_OPTIONS}
                    value={density}
                    onChange={(id) => {
                      setDensity(id);
                      setTemplateId(null);
                      pushParent({ density: id, templateId: null });
                    }}
                    muted={chromeMuted}
                    border={chromeBorder}
                    accent={accent}
                    textColor={chromeText}
                    fontFamily={uiFont}
                  />
                </div>
                <div>
                  <div
                    className="mb-1.5 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: chromeMuted }}
                  >
                    Shadow depth
                  </div>
                  <Segmented
                    options={SHADOW_OPTIONS}
                    value={shadow}
                    onChange={(id) => {
                      setShadow(id);
                      setTemplateId(null);
                      pushParent({ shadow: id, templateId: null });
                    }}
                    muted={chromeMuted}
                    border={chromeBorder}
                    accent={accent}
                    textColor={chromeText}
                    fontFamily={uiFont}
                  />
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: theme.radiusPx,
                    boxShadow: theme.shadowCss,
                  }}
                >
                  <div
                    className="text-[11px] font-bold"
                    style={{ color: theme.text, fontFamily: pair.heading.family }}
                  >
                    Shape preview
                  </div>
                  <p
                    className="mt-1 text-[10px]"
                    style={{ color: theme.muted, fontFamily: pair.body.family }}
                  >
                    Radius {radius} · {density} · {shadow} shadow
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-3 py-1.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: theme.highlight,
                      color: theme.background,
                      borderRadius: theme.radiusPx,
                      fontFamily: pair.body.family,
                    }}
                  >
                    Sample button
                  </button>
                </div>
              </div>
            )}

            {/* UI PATTERN */}
            {panel === "pattern" && (
              <div className="space-y-2">
                <p className="text-[11px] leading-relaxed" style={{ color: chromeMuted }}>
                  Stress-test your system on real product patterns.
                </p>
                {PATTERNS.map((p) => {
                  const Icon = p.icon;
                  const active = pattern === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPattern(p.id);
                        pushParent({ pattern: p.id });
                      }}
                      className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all"
                      style={{
                        background: active ? `${accent}20` : chromeSurface,
                        border: active
                          ? `1px solid ${accent}55`
                          : `1px solid ${chromeBorder}`,
                      }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: active
                            ? `linear-gradient(135deg, ${accent}, ${accent}99)`
                            : chromeBorder,
                          color: active ? "#FFF" : chromeMuted,
                        }}
                      >
                        <Icon size={15} />
                      </span>
                      <span>
                        <span
                          className="block text-[11px] font-extrabold"
                          style={{ color: chromeText }}
                        >
                          {p.label}
                        </span>
                        <span
                          className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide"
                          style={{ color: accent }}
                        >
                          {p.principle}
                        </span>
                        <span
                          className="mt-1 block text-[10px] leading-snug"
                          style={{ color: chromeMuted }}
                        >
                          {p.psychology}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div
            className="flex flex-wrap items-center gap-2 border-t p-3"
            style={{ borderColor: chromeBorder }}
          >
            <ExportPaletteMenu
              palette={exportPayload}
              onCopied={onCopied}
              fontFamily={uiFont}
              buttonBg={chromeSurface}
              buttonColor={chromeText}
              borderColor={chromeBorder}
            />
            <button
              type="button"
              onClick={() => {
                const next = mode === "dark" ? "light" : "dark";
                setMode(next);
                pushParent({ mode: next });
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: chromeSurface,
                color: chromeMuted,
                border: `1px solid ${chromeBorder}`,
              }}
              title="Toggle dark/light preview"
            >
              {mode === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            {typeof onApplyWorkspace === "function" && (
              <button
                type="button"
                onClick={() =>
                  onApplyWorkspace({
                    background: adapted.background,
                    text: adapted.text,
                    accent: adapted.accent,
                    emotion,
                    label: "Studio apply",
                  })
                }
                className="ml-auto rounded-full px-3 py-1.5 text-[10px] font-bold transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: chromeIsDark ? "#0A0A0A" : "#FFF",
                  fontFamily: uiFont,
                }}
              >
                Apply to workspace
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Stage ──────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Stage chrome */}
        <div
          className="mb-3 flex flex-wrap items-center justify-between gap-2"
          style={{ fontFamily: uiFont }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}44`,
              }}
            >
              <Sparkles size={10} />
              Live stage
            </span>
            <span className="text-[11px] font-bold" style={{ color: chromeText }}>
              {PATTERNS.find((p) => p.id === pattern)?.label || "Hero"}
            </span>
            <span className="text-[10px]" style={{ color: chromeMuted }}>
              · {pair.heading.name} + {pair.body.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[theme.background, theme.text, theme.highlight].map((c, i) => (
              <span
                key={i}
                className="h-5 w-5 rounded-full"
                style={{
                  backgroundColor: c,
                  boxShadow: `0 0 0 1px ${chromeBorder}`,
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Quick pattern strip */}
        <div className="mb-3 flex flex-wrap gap-1.5" style={{ fontFamily: uiFont }}>
          {PATTERNS.map((p) => {
            const Icon = p.icon;
            const active = pattern === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPattern(p.id);
                  pushParent({ pattern: p.id });
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all"
                style={{
                  background: active ? `${accent}28` : chromeSurface,
                  color: active ? chromeText : chromeMuted,
                  border: active
                    ? `1px solid ${accent}55`
                    : `1px solid ${chromeBorder}`,
                }}
              >
                <Icon size={12} />
                {p.short}
              </button>
            );
          })}
        </div>

        <div
          className="overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            border: `1px solid ${chromeBorder}`,
            boxShadow: chromeIsDark
              ? "0 24px 64px rgba(0,0,0,0.4)"
              : "0 20px 50px rgba(0,0,0,0.1)",
          }}
        >
          <PatternView theme={theme} />
        </div>

        <p
          className="mt-3 text-[11px] leading-relaxed"
          style={{ color: chromeMuted, fontFamily: uiFont, maxWidth: 560 }}
        >
          {PATTERNS.find((p) => p.id === pattern)?.psychology}
        </p>
      </div>
    </div>
  );
}
