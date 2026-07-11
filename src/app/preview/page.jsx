/**
 * /preview — Premium Emotion Design Studio
 * Full customization of palette, shape, density, shadows, and UI patterns.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Github } from "lucide-react";
import PreviewStudio from "../../components/previews/PreviewStudio";
import PsychologyNav from "../../components/PsychologyNav";
import CustomCursor from "../../components/CustomCursor";
import CopyToast from "../../components/CopyToast";
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

export const meta = () => buildPageMeta("preview");
export const links = () => buildPageLinks("preview");

function safeInitialPalette() {
  try {
    return readActivePalette();
  } catch {
    return {
      background: "#0B1B33",
      text: "#F0F9FF",
      accent: "#3B82F6",
      emotion: "trust",
    };
  }
}

export default function PreviewPage() {
  const initial = useMemo(() => safeInitialPalette(), []);

  const [bgColor, setBgColor] = useState(() => initial.background || "#0B1B33");
  const [textColor, setTextColor] = useState(() => initial.text || "#F0F9FF");
  const [accentHex, setAccentHex] = useState(() => initial.accent || "#3B82F6");
  const [activeEmotion, setActiveEmotion] = useState(
    () => initial.emotion || "trust",
  );
  const [toastMsg, setToastMsg] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const sigRef = useRef(
    paletteSignature({
      background: initial.background,
      text: initial.text,
      accent: initial.accent,
      emotion: initial.emotion,
    }),
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 960);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const applyExternal = useCallback((p) => {
    if (!p?.background || !p?.text) return;
    const nextSig = paletteSignature(p);
    if (nextSig === sigRef.current) return;
    sigRef.current = nextSig;
    setBgColor(p.background);
    setTextColor(p.text);
    setAccentHex(p.accent || p.highlight || "#3B82F6");
    if (p.emotion) setActiveEmotion(p.emotion);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== ACTIVE_PALETTE_KEY || !e.newValue) return;
      try {
        applyExternal(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    const onCustom = (e) => {
      if (e?.detail) applyExternal(e.detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("seeui:palette", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("seeui:palette", onCustom);
    };
  }, [applyExternal]);

  const typePair =
    useDynamicFonts(activeEmotion || "trust") ||
    getTypographyForEmotion(activeEmotion);

  const { recent, clearRecent, removeRecent, pushRecent } = useRecentPalettes();

  const isDark = getContrastColor(bgColor) === "#FFFFFF";
  const mutedColor = useMemo(() => getMutedContrastColor(bgColor), [bgColor]);
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const chipBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.8)";
  const fontFamily = "'Inter', system-ui, sans-serif";

  const handleStudioChange = useCallback(
    (state) => {
      if (!state?.background || !state?.text) return;
      const payload = {
        background: state.background,
        text: state.text,
        accent: state.accent,
        emotion: state.emotion || "trust",
        label: state.templateId ? `Studio · ${state.templateId}` : "Studio",
      };
      const sig = paletteSignature(payload);
      if (sig === sigRef.current) {
        writeActivePalette(payload, { silent: true });
        return;
      }
      sigRef.current = sig;
      setBgColor(payload.background);
      setTextColor(payload.text);
      setAccentHex(payload.accent);
      setActiveEmotion(payload.emotion);
      writeActivePalette(payload, { silent: true });
      // Save template / meaningful studio edits into history
      if (state.templateId) {
        pushRecent(payload, {
          source: "studio",
          label: payload.label,
          emotion: payload.emotion,
        });
      }
    },
    [pushRecent],
  );

  const handleApplyToWorkspace = useCallback(
    (palette) => {
      if (!palette?.background || !palette?.text) return;
      const payload = {
        background: palette.background,
        text: palette.text,
        accent: palette.accent,
        emotion: palette.emotion || activeEmotion,
        label: palette.label || "Studio apply",
      };
      sigRef.current = paletteSignature(payload);
      setBgColor(payload.background);
      setTextColor(payload.text);
      setAccentHex(payload.accent);
      if (payload.emotion) setActiveEmotion(payload.emotion);
      applyToWorkspace(payload, {
        source: "studio",
        label: payload.label,
        emotion: payload.emotion,
        silent: false,
      });
      pushRecent(payload, { source: "studio", label: payload.label });
      setToastMsg("Applied to workspace!");
    },
    [activeEmotion, pushRecent],
  );

  const handleToast = useCallback((label) => {
    setToastMsg(label ? `Copied ${label}!` : "Copied!");
  }, []);

  if (isMobile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-8"
        style={{
          background: "linear-gradient(145deg, #0B1220 0%, #1E1B4B 50%, #0F172A 100%)",
          fontFamily,
        }}
      >
        <div
          className="max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white"
            style={{
              background: "linear-gradient(135deg, #6366F1, #A855F7)",
            }}
          >
            S
          </div>
          <h1 className="mb-2 text-xl font-extrabold text-white">
            Studio needs desktop
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-white/55">
            The Emotion Design Studio is built for wide canvases — open on a
            larger screen to customize themes fully.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-full px-5 py-2.5 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)" }}
          >
            Back to workspace
          </Link>
        </div>
      </div>
    );
  }

  const headingFont =
    typePair?.heading?.family || "'Inter', system-ui, sans-serif";

  return (
    <>
      <CustomCursor
        accent={accentHex || "#818CF8"}
        textColor={textColor}
        enabled
      />
      <CopyToast
        message={toastMsg || "Copied!"}
        visible={!!toastMsg}
        onHide={() => setToastMsg(null)}
      />

      <main
        className="min-h-screen w-full"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          transition: "background-color 0.5s ease, color 0.4s ease",
        }}
      >
        {/* Ambient gradient wash */}
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          style={{
            background: isDark
              ? `radial-gradient(ellipse 80% 50% at 20% -10%, ${accentHex}33, transparent),
                 radial-gradient(ellipse 60% 40% at 90% 10%, ${accentHex}18, transparent)`
              : `radial-gradient(ellipse 80% 50% at 20% -10%, ${accentHex}22, transparent)`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 pb-20 pt-6 sm:px-8 lg:px-10">
          {/* Premium top bar */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-95"
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
                  SeeUI Studio
                </div>
                <h1
                  className="text-lg font-extrabold tracking-tight sm:text-xl"
                  style={{ fontFamily: headingFont }}
                >
                  Emotion Design Studio
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
                activeId="preview"
              />
              <a
                href="https://github.com/SomratChandraRoy/seeui"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105"
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

          {/* Intro strip */}
          <section className="mb-6 max-w-2xl">
            <p
              className="text-sm leading-relaxed sm:text-[15px]"
              style={{
                color: mutedColor,
                fontFamily: typePair?.body?.family || fontFamily,
              }}
            >
              Pick a professional theme, then customize{" "}
              <strong style={{ color: textColor }}>every token</strong> — colors,
              corners, density, shadows, and UI pattern. Built for a premium
              emotional feel with clear, calm controls.
            </p>
          </section>

          {/* Studio */}
          <PreviewStudio
            background={bgColor}
            text={textColor}
            accent={accentHex}
            emotionId={activeEmotion}
            onChange={handleStudioChange}
            onCopied={handleToast}
            onApplyWorkspace={handleApplyToWorkspace}
          />

          <RecentPalettes
            recent={recent}
            onApply={(p) =>
              handleApplyToWorkspace({
                background: p.background,
                text: p.text,
                accent: p.accent || p.highlight,
                emotion: p.emotion,
                label: p.label || "History",
              })
            }
            onClear={clearRecent}
            onRemove={removeRecent}
            cardBg={cardBg}
            cardBorder={cardBorder}
            mutedColor={mutedColor}
            textColor={textColor}
            fontFamily={fontFamily}
            isDark={isDark}
            activeKey={`${bgColor}|${textColor}|${accentHex}`}
            title="History · studio & more"
          />

          {/* Footer journey */}
          <footer
            className="mt-10 rounded-2xl p-5 sm:p-6"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.7)",
              border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              className="mb-3 text-[9px] font-black uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily }}
            >
              Continue your design journey
            </div>
            <PsychologyNav
              variant="full"
              textColor={textColor}
              mutedColor={mutedColor}
              chipBg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
              cardBorder={cardBorder}
              fontFamily={fontFamily}
              isDark={isDark}
              accent={accentHex || "#818CF8"}
              activeId="preview"
            />
          </footer>
        </div>
      </main>
    </>
  );
}
