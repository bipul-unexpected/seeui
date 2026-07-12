/**
 * /extract — Image → Emotion Extractor (flagship page)
 * Production-ready: psychology-first copy, SeeUI theme sync, apply-to-workspace.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Github,
  Eye,
  Brain,
  Palette,
  Type,
  ShieldCheck,
} from "lucide-react";
import ImageEmotionExtractor from "../../components/ImageEmotionExtractor";
import PsychologyNav from "../../components/PsychologyNav";
import CustomCursor from "../../components/CustomCursor";
import { GITHUB_REPO_URL } from "../../data/branding";
import {
  ACTIVE_PALETTE_KEY,
  paletteSignature,
  readActivePalette,
  writeActivePalette,
} from "../../utils/activePaletteStore";
import { applyToWorkspace } from "../../utils/workspaceApply";
import { useRecentPalettes } from "../../utils/useRecentPalettes";
import RecentPalettes from "../../components/RecentPalettes";
import {
  getContrastColor,
  getMutedContrastColor,
} from "../../utils/getContrastColor";
import { useDynamicFonts } from "../../utils/useDynamicFonts";
import { getTypographyForEmotion } from "../../data/emotionTypography";
import { buildPageMeta, buildPageLinks } from "../../data/seo";

export const meta = () => buildPageMeta("extract");
export const links = () => buildPageLinks("extract");

function safeInitial() {
  try {
    return readActivePalette();
  } catch {
    return {
      background: "#0F172A",
      text: "#F8FAFC",
      accent: "#818CF8",
      emotion: "trust",
    };
  }
}

const STEPS = [
  {
    icon: Eye,
    title: "See",
    text: "Upload a photo — we only process it in your browser.",
  },
  {
    icon: Palette,
    title: "Sample",
    text: "Canvas downscales the image and pulls 3–5 dominant colors.",
  },
  {
    icon: Brain,
    title: "Feel",
    text: "HSL psychology maps hues to Energy, Trust, Joy, and more.",
  },
  {
    icon: Type,
    title: "Type",
    text: "Get a heading + body font pairing that matches the mood.",
  },
];

export default function ExtractPage() {
  const initial = useMemo(() => safeInitial(), []);

  const [bgColor, setBgColor] = useState(() => initial.background || "#0F172A");
  const [textColor, setTextColor] = useState(() => initial.text || "#F8FAFC");
  const [accentHex, setAccentHex] = useState(() => initial.accent || "#818CF8");
  const [emotion, setEmotion] = useState(() => initial.emotion || "trust");

  const typePair =
    useDynamicFonts(emotion || "trust") || getTypographyForEmotion(emotion);

  const { recent, clearRecent, removeRecent, pushRecent } = useRecentPalettes();

  const isDark = getContrastColor(bgColor) === "#FFFFFF";
  const mutedColor = useMemo(() => getMutedContrastColor(bgColor), [bgColor]);
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.88)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const chipBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.78)";
  const fontFamily = "'Inter', system-ui, sans-serif";
  const headingFont = typePair?.heading?.family || fontFamily;
  const bodyFont = typePair?.body?.family || fontFamily;

  // Keep store in sync (silent — no event loops while browsing)
  useEffect(() => {
    writeActivePalette(
      {
        background: bgColor,
        text: textColor,
        accent: accentHex,
        emotion,
        label: "Image extract",
      },
      { silent: true },
    );
  }, [bgColor, textColor, accentHex, emotion]);

  // Pull updates from workspace / other pages
  useEffect(() => {
    const apply = (p) => {
      if (!p?.background || !p?.text) return;
      const sig = paletteSignature(p);
      const cur = paletteSignature({
        background: bgColor,
        text: textColor,
        accent: accentHex,
        emotion,
      });
      if (sig === cur) return;
      setBgColor(p.background);
      setTextColor(p.text);
      setAccentHex(p.accent || p.highlight || accentHex);
      if (p.emotion) setEmotion(p.emotion);
    };
    const onStorage = (e) => {
      if (e.key !== ACTIVE_PALETTE_KEY || !e.newValue) return;
      try {
        apply(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    const onPalette = (e) => {
      if (e?.detail) apply(e.detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("seeui:palette", onPalette);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("seeui:palette", onPalette);
    };
  }, [bgColor, textColor, accentHex, emotion]);

  /** Apply to global workspace + history (home canvas updates live) */
  const handleApply = useCallback(
    (palette) => {
      if (!palette?.background || !palette?.text) return;
      const payload = {
        background: palette.background,
        text: palette.text,
        accent: palette.accent,
        emotion: palette.emotion,
        label: palette.label || "Image emotion",
      };
      setBgColor(payload.background);
      setTextColor(payload.text);
      if (payload.accent) setAccentHex(payload.accent);
      if (payload.emotion) setEmotion(payload.emotion);
      applyToWorkspace(payload, {
        source: "extract",
        label: payload.label,
        emotion: payload.emotion,
        silent: false,
      });
      pushRecent(payload, { source: "extract", label: payload.label });
    },
    [pushRecent],
  );

  const handleHistoryApply = useCallback(
    (p) => {
      handleApply({
        background: p.background,
        text: p.text,
        accent: p.accent || p.highlight,
        emotion: p.emotion,
        label: p.label || "History",
      });
    },
    [handleApply],
  );

  return (
    <>
      <CustomCursor
        accent={accentHex || "#818CF8"}
        textColor={textColor}
        enabled
      />

      <main
        className="min-h-screen w-full"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: bodyFont,
          transition: "background-color 0.5s ease, color 0.4s ease",
        }}
      >
        {/* Ambient psychology glow */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background: isDark
              ? `radial-gradient(ellipse 80% 50% at 10% -5%, ${accentHex}28, transparent 55%),
                 radial-gradient(ellipse 50% 40% at 95% 15%, ${accentHex}14, transparent 50%)`
              : `radial-gradient(ellipse 80% 50% at 15% 0%, ${accentHex}18, transparent 50%)`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-7 sm:px-8 lg:px-10">
          {/* Top bar */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-transform hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: chipBg,
                  color: textColor,
                  border: `1px solid ${cardBorder}`,
                  fontFamily,
                  backdropFilter: "blur(12px)",
                }}
              >
                <ArrowLeft size={12} />
                Workspace
              </Link>
              <div>
                <div
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: mutedColor, fontFamily }}
                >
                  Perception · Psychology
                </div>
                <h1
                  className="text-lg font-extrabold tracking-tight sm:text-xl"
                  style={{ fontFamily: headingFont }}
                >
                  Image Emotion Extractor
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PsychologyNav
                textColor={textColor}
                mutedColor={mutedColor}
                chipBg={chipBg}
                cardBorder={cardBorder}
                fontFamily={fontFamily}
                isDark={isDark}
                accent={accentHex || "#818CF8"}
                activeId="extract"
              />
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: chipBg,
                  color: textColor,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <Github size={14} />
              </a>
            </div>
          </header>

          {/* Hero intro */}
          <section className="mb-6 max-w-2xl">
            <div
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold"
              style={{
                background: `${accentHex}22`,
                color: accentHex,
                border: `1px solid ${accentHex}44`,
                fontFamily,
              }}
            >
              <ShieldCheck size={12} />
              100% private · canvas-only · no server upload
            </div>
            <h2
              className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
              style={{ fontFamily: headingFont }}
            >
              What does this image{" "}
              <span style={{ color: accentHex }}>feel</span> like?
            </h2>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: mutedColor, fontFamily: bodyFont }}
            >
              Drop a photo. SeeUI samples dominant colors, reads Hue · Saturation ·
              Lightness, and returns a primary emotion with type recommendations
              you can apply to the live workspace.
            </p>
          </section>

          {/* How it works — simple human-readable steps */}
          <section className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl p-3.5"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{
                        background: `${accentHex}22`,
                        color: accentHex,
                      }}
                    >
                      <Icon size={15} />
                    </span>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: mutedColor, fontFamily }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <div
                    className="text-[13px] font-extrabold"
                    style={{ color: textColor, fontFamily: headingFont }}
                  >
                    {step.title}
                  </div>
                  <p
                    className="mt-1 text-[10px] leading-relaxed"
                    style={{ color: mutedColor, fontFamily }}
                  >
                    {step.text}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Main extractor */}
          <ImageEmotionExtractor
            onApplyPalette={handleApply}
            cardBg={cardBg}
            cardBorder={cardBorder}
            mutedColor={mutedColor}
            textColor={textColor}
            fontFamily={fontFamily}
            isDark={isDark}
            accent={accentHex || "#818CF8"}
          />

          <RecentPalettes
            recent={recent}
            onApply={handleHistoryApply}
            onClear={clearRecent}
            onRemove={removeRecent}
            cardBg={cardBg}
            cardBorder={cardBorder}
            mutedColor={mutedColor}
            textColor={textColor}
            fontFamily={fontFamily}
            isDark={isDark}
            activeKey={`${bgColor}|${textColor}|${accentHex}`}
            title="History · extract & more"
            emptyHint="Analyzed and applied palettes appear here. Click any to re-apply to the workspace."
          />

          {/* Psychology legend — easy to understand */}
          <section
            className="mt-5 rounded-2xl p-5"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="mb-3 text-[9.5px] font-black uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily }}
            >
              How color becomes emotion
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Energy & Passion",
                  rule: "Warm reds/oranges · high saturation",
                  tip: "Use for CTAs and launches",
                },
                {
                  name: "Trust & Serenity",
                  rule: "Cool blues · balanced lightness",
                  tip: "Dashboards & finance UIs",
                },
                {
                  name: "Growth & Safety",
                  rule: "Greens · earthy mid tones",
                  tip: "Wellness & progress metrics",
                },
                {
                  name: "Joy & Optimism",
                  rule: "Yellow/gold · high lightness",
                  tip: "Consumer & education brands",
                },
                {
                  name: "Mystery & Melancholy",
                  rule: "Low lightness · muted chroma",
                  tip: "Premium night / editorial",
                },
                {
                  name: "Luxury · Love · Calm",
                  rule: "Purple · rose · neutrals",
                  tip: "Lifestyle & minimal tools",
                },
              ].map((row) => (
                <div
                  key={row.name}
                  className="rounded-xl p-3"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                    border: `1px solid ${cardBorder}`,
                  }}
                >
                  <div
                    className="text-[12px] font-extrabold"
                    style={{ color: textColor, fontFamily }}
                  >
                    {row.name}
                  </div>
                  <div
                    className="mt-0.5 text-[10px] font-semibold"
                    style={{ color: accentHex, fontFamily }}
                  >
                    {row.rule}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: mutedColor, fontFamily }}
                  >
                    {row.tip}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next steps */}
          <section className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/preview"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold transition-transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
                color: isDark ? "#0A0A0A" : "#FFF",
                fontFamily,
              }}
            >
              Test palette in Design Studio →
            </Link>
            <Link
              to="/#gallery"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold"
              style={{
                backgroundColor: chipBg,
                color: textColor,
                border: `1px solid ${cardBorder}`,
                fontFamily,
              }}
            >
              Browse emotion gallery
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
