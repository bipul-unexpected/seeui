/**
 * Premium journey cards — Studio · Extract · Gradients
 * Clean hierarchy, theme-aware glass, polished CTAs.
 */

import { Link } from "react-router";
import {
  ArrowRight,
  LayoutTemplate,
  ImageIcon,
  Sparkles,
  Layers,
  Waves,
} from "lucide-react";

/**
 * @param {object} props
 * @param {string} props.textColor
 * @param {string} props.mutedColor
 * @param {string} props.cardBg
 * @param {string} props.cardBorder
 * @param {string} props.headingFontFamily
 * @param {string} props.bodyFontFamily
 * @param {boolean} props.isDark
 * @param {string} [props.accent]
 * @param {string} [props.bgColor]
 */
export default function StudioJourneyCards({
  textColor,
  mutedColor,
  cardBg,
  cardBorder,
  headingFontFamily,
  bodyFontFamily,
  isDark,
  accent = "#818CF8",
  bgColor = "#0F172A",
}) {
  const cards = [
    {
      id: "studio",
      to: "/preview",
      eyebrow: "Decision",
      title: "Emotion Design Studio",
      description:
        "Apply your live palette to premium UI templates — heroes, dashboards, product cards, and auth — with design tokens ready to ship.",
      cta: "Open Studio",
      tags: ["Templates", "Tokens", "Live UI"],
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
      glow: "rgba(99,102,241,0.28)",
      Icon: LayoutTemplate,
      preview: (
        <div className="flex gap-1.5 mt-1">
          <div className="h-8 flex-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="h-8 w-8 rounded-lg" style={{ background: "rgba(255,255,255,0.35)" }} />
          <div className="h-8 flex-[0.6] rounded-lg" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
      ),
    },
    {
      id: "extract",
      to: "/extract",
      eyebrow: "Perception",
      title: "Image Emotion Extractor",
      description:
        "Upload a photo, decode dominant hues, and map them to emotion psychology — then push the palette into your workspace.",
      cta: "Open Extractor",
      tags: ["Photo", "HSL", "Psychology"],
      gradient: "linear-gradient(135deg, #EC4899 0%, #D946EF 45%, #A855F7 100%)",
      glow: "rgba(236,72,153,0.28)",
      Icon: ImageIcon,
      preview: (
        <div className="flex items-end gap-1 mt-1 h-8">
          {[40, 70, 55, 90, 48].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: `rgba(255,255,255,${0.15 + i * 0.08})`,
              }}
            />
          ))}
        </div>
      ),
    },
    {
      id: "gradient",
      to: "/gradient",
      eyebrow: "Motion · Mood",
      title: "Pro Gradient Builder",
      description:
        "Craft linear, radial, conic, and mesh fields with emotion profiles and flow animation — export CSS for real product heroes.",
      cta: "Open Gradients",
      tags: ["Linear", "Mesh", "Animate"],
      gradient:
        "linear-gradient(135deg, #F43F5E 0%, #8B5CF6 40%, #3B82F6 70%, #10B981 100%)",
      glow: "rgba(59,130,246,0.28)",
      Icon: Waves,
      preview: (
        <div
          className="mt-1 h-8 w-full rounded-lg"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1), rgba(255,255,255,0.4))",
            backgroundSize: "200% 100%",
          }}
        />
      ),
    },
  ];

  const surface = isDark
    ? "linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)"
    : "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)";

  return (
    <section
      className="mt-3 rounded-3xl overflow-hidden transition-colors duration-500"
      style={{
        background: surface,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.25)"
          : "0 16px 40px rgba(15,23,42,0.08)",
      }}
    >
      {/* Section header */}
      <div
        className="px-5 sm:px-7 pt-6 pb-5 flex flex-wrap items-end justify-between gap-4"
        style={{ borderBottom: `1px solid ${cardBorder}` }}
      >
        <div className="min-w-0 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{
                background: isDark
                  ? `${accent}22`
                  : `${accent}14`,
                color: accent,
                border: `1px solid ${accent}44`,
                fontFamily: bodyFontFamily,
              }}
            >
              <Sparkles size={10} />
              Product suite
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight"
            style={{ color: textColor, fontFamily: headingFontFamily }}
          >
            Go beyond the canvas
          </h2>
          <p
            className="mt-1.5 text-[13px] leading-relaxed"
            style={{ color: mutedColor, fontFamily: bodyFontFamily }}
          >
            Three focused tools that turn your emotion palette into real UI,
            photo-driven systems, and motion-ready gradients.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: mutedColor, fontFamily: bodyFontFamily }}
        >
          <Layers size={12} style={{ color: accent }} />
          Studio · Extract · Gradient
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <Link
              key={card.id}
              to={card.to}
              className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2"
              style={{
                background: isDark
                  ? "rgba(0,0,0,0.28)"
                  : "rgba(255,255,255,0.85)",
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark
                  ? "0 8px 28px rgba(0,0,0,0.25)"
                  : "0 8px 24px rgba(15,23,42,0.06)",
                ["--tw-ring-color"]: accent,
              }}
            >
              {/* Top gradient ribbon + mini preview */}
              <div
                className="relative px-4 pt-4 pb-3"
                style={{
                  background: card.gradient,
                  boxShadow: `inset 0 -1px 0 rgba(255,255,255,0.12)`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.28)",
                      color: "#FFF",
                      backdropFilter: "blur(8px)",
                      boxShadow: `0 8px 24px ${card.glow}`,
                    }}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.22)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      fontFamily: bodyFontFamily,
                    }}
                  >
                    {card.eyebrow}
                  </span>
                </div>
                {card.preview}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
                <h3
                  className="text-[15px] font-extrabold tracking-tight leading-snug"
                  style={{ color: textColor, fontFamily: headingFontFamily }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-2 text-[12px] leading-relaxed flex-1"
                  style={{ color: mutedColor, fontFamily: bodyFontFamily }}
                >
                  {card.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: isDark ? "#C8C8D8" : "#475569",
                        background: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(15,23,42,0.05)",
                        border: `1px solid ${cardBorder}`,
                        fontFamily: bodyFontFamily,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  className="mt-4 inline-flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-bold transition-all duration-300 group-hover:gap-3"
                  style={{
                    background: card.gradient,
                    color: "#FFFFFF",
                    fontFamily: bodyFontFamily,
                    boxShadow: `0 6px 20px ${card.glow}`,
                  }}
                >
                  <span>{card.cta}</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </div>
              </div>

              {/* Soft outer glow on hover via pseudo border */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px ${accent}33, 0 16px 40px ${card.glow}`,
                }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
