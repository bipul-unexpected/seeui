/**
 * /gradient — Emotion-Based Pro Gradient Builder & Animator
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Github } from "lucide-react";
import GradientStudio from "../../components/GradientStudio";
import PsychologyNav from "../../components/PsychologyNav";
import CustomCursor from "../../components/CustomCursor";
import CopyToast from "../../components/CopyToast";
import RecentPalettes from "../../components/RecentPalettes";
import {
  readActivePalette,
  writeActivePalette,
} from "../../utils/activePaletteStore";
import { applyToWorkspace } from "../../utils/workspaceApply";
import { useRecentPalettes } from "../../utils/useRecentPalettes";
import {
  getContrastColor,
  getMutedContrastColor,
} from "../../utils/getContrastColor";
import { buildPageMeta, buildPageLinks } from "../../data/seo";

export const meta = () => buildPageMeta("gradient");
export const links = () => buildPageLinks("gradient");

export default function GradientPage() {
  const stored = readActivePalette();
  const [bgColor, setBgColor] = useState(stored.background || "#0B1B33");
  const [textColor, setTextColor] = useState(stored.text || "#F0F9FF");
  const [accentHex, setAccentHex] = useState(stored.accent || "#3B82F6");
  const [emotion, setEmotion] = useState(stored.emotion || "trust");
  const [toastMsg, setToastMsg] = useState(null);

  const { recent, clearRecent, removeRecent, pushRecent } = useRecentPalettes();

  const isDark = getContrastColor(bgColor) === "#FFFFFF";
  const mutedColor = useMemo(() => getMutedContrastColor(bgColor), [bgColor]);
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const chipBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.8)";
  const fontFamily = "'Inter', system-ui, sans-serif";

  useEffect(() => {
    writeActivePalette(
      {
        background: bgColor,
        text: textColor,
        accent: accentHex,
        emotion,
        label: "Gradient studio",
      },
      { silent: true },
    );
  }, [bgColor, textColor, accentHex, emotion]);

  const handleApply = useCallback(
    (palette) => {
      if (!palette?.background || !palette?.text) return;
      setBgColor(palette.background);
      setTextColor(palette.text);
      if (palette.accent) setAccentHex(palette.accent);
      if (palette.emotion) setEmotion(palette.emotion);
      applyToWorkspace(palette, {
        source: "gradient",
        label: palette.label || "Gradient",
        emotion: palette.emotion,
        silent: false,
      });
      pushRecent(palette, {
        source: "gradient",
        label: palette.label || "Gradient",
      });
      setToastMsg("Applied to workspace!");
    },
    [pushRecent],
  );

  const handleToast = useCallback((msg) => setToastMsg(msg), []);

  return (
    <>
      <CustomCursor accent={accentHex} textColor={textColor} enabled />
      <CopyToast
        message={toastMsg || "Copied!"}
        visible={!!toastMsg}
        onHide={() => setToastMsg(null)}
      />

      <main
        className="min-h-screen w-full"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #08080c 0%, #12121a 45%, #0a0a12 100%)"
            : "linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 100%)",
          color: isDark ? "#F8FAFC" : "#0F172A",
          fontFamily,
        }}
      >
        <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  backgroundColor: chipBg,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <ArrowLeft size={12} />
                Workspace
              </Link>
              <div>
                <div
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: mutedColor }}
                >
                  SeeUI · Motion & Mood
                </div>
                <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                  Pro Gradient Builder
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PsychologyNav
                textColor={isDark ? "#F8FAFC" : "#0F172A"}
                mutedColor={mutedColor}
                chipBg={chipBg}
                cardBorder={cardBorder}
                fontFamily={fontFamily}
                isDark={isDark}
                accent={accentHex}
                activeId="gradient"
              />
              <a
                href="https://github.com/SomratChandraRoy/seeui"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: chipBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <Github size={14} />
              </a>
            </div>
          </header>

          <p
            className="mb-6 max-w-2xl text-sm leading-relaxed"
            style={{ color: mutedColor }}
          >
            Pick an emotion. Generate multi-stop gradients (linear, radial, conic,
            mesh), dial the angle, toggle a flowing animation, and export
            production CSS or Tailwind — then apply solids to the live workspace.
          </p>

          <GradientStudio
            initialEmotion={emotion || "trust"}
            onApplyWorkspace={handleApply}
            onToast={handleToast}
          />

          <RecentPalettes
            recent={recent}
            onApply={(p) =>
              handleApply({
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
            textColor={isDark ? "#F8FAFC" : "#0F172A"}
            fontFamily={fontFamily}
            isDark={isDark}
            activeKey={`${bgColor}|${textColor}|${accentHex}`}
            title="History · gradients & more"
          />
        </div>
      </main>
    </>
  );
}
