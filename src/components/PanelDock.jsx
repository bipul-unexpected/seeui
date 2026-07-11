/**
 * PanelDock — theme-reactive Limelight Nav for SeeUI floating palettes.
 * Glass, icons, limelight, and dots all track live bg / text / accent.
 */

import { useMemo } from "react";
import {
  Palette,
  ImageIcon,
  Heart,
  Type,
  LayoutTemplate,
  LayoutGrid,
} from "lucide-react";
import { LimelightNav } from "./ui/limelight-nav";
import { getContrastColor, getMutedContrastColor } from "../utils/getContrastColor";

/** @typedef {'color'|'image'|'emotion'|'type'|'gallery'} PanelId */

const PANEL_ORDER = /** @type {PanelId[]} */ ([
  "color",
  "image",
  "emotion",
  "gallery",
  "type",
]);

/**
 * @param {object} props
 * @param {Record<PanelId, boolean>} props.open
 * @param {(id: PanelId) => void} props.onToggle
 * @param {PanelId|null} [props.focusId]
 * @param {(id: PanelId) => void} [props.onFocus]
 * @param {boolean} [props.isDark]
 * @param {string} [props.accent]
 * @param {string} [props.background] live page background
 * @param {string} [props.textColor] live page text
 * @param {string} [props.mutedColor]
 * @param {boolean} [props.hidden]
 */
export default function PanelDock({
  open,
  onToggle,
  focusId = "color",
  onFocus,
  isDark = true,
  accent: accentProp,
  background = "#0F172A",
  textColor,
  mutedColor,
  hidden = false,
}) {
  const activeIndex = Math.max(0, PANEL_ORDER.indexOf(focusId || "color"));

  // Resolve a full theme from the live canvas every render
  const theme = useMemo(() => {
    const bg = normalizeHex(background) || (isDark ? "#0F172A" : "#F8FAFC");
    const ink =
      normalizeHex(textColor) || getContrastColor(bg) || (isDark ? "#F8FAFC" : "#0F172A");
    // Prefer accent; if missing use a vivid contrast on bg
    let accent =
      normalizeHex(accentProp) ||
      normalizeHex(ink) ||
      (isDark ? "#A5B4FC" : "#4F46E5");

    // If accent equals bg (invisible limelight), fall back to ink or indigo
    if (accent.toUpperCase() === bg.toUpperCase()) {
      accent = ink.toUpperCase() === bg.toUpperCase()
        ? isDark
          ? "#A5B4FC"
          : "#4F46E5"
        : ink;
    }

    const muted =
      normalizeHex(mutedColor) ||
      getMutedContrastColor(bg) ||
      (isDark ? "rgba(248,250,252,0.45)" : "rgba(15,23,42,0.45)");

    // Glass shell: tinted from page background so dock always matches theme
    const shellBg = isDark
      ? `linear-gradient(155deg, ${hexToRgba(bg, 0.92)} 0%, ${hexToRgba(mixToward(bg, "#000000", 0.35), 0.96)} 100%)`
      : `linear-gradient(155deg, ${hexToRgba(bg, 0.94)} 0%, ${hexToRgba(mixToward(bg, "#FFFFFF", 0.2), 0.98)} 100%)`;

    const shellBorder = isDark
      ? hexToRgba(ink, 0.14)
      : hexToRgba(ink, 0.12);

    const shellShadow = isDark
      ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${hexToRgba(ink, 0.06)}, 0 0 48px ${hexToRgba(accent, 0.28)}`
      : `0 16px 40px ${hexToRgba(ink, 0.12)}, 0 0 0 1px ${hexToRgba(ink, 0.06)}, 0 0 36px ${hexToRgba(accent, 0.22)}`;

    const legendBg = isDark ? hexToRgba(bg, 0.72) : hexToRgba(bg, 0.88);
    const legendInk = typeof muted === "string" && muted.startsWith("#")
      ? muted
      : isDark
        ? hexToRgba(ink, 0.55)
        : hexToRgba(ink, 0.5);

    const idleDot = isDark ? hexToRgba(ink, 0.22) : hexToRgba(ink, 0.18);

    return {
      bg,
      ink,
      accent,
      muted: legendInk,
      shellBg,
      shellBorder,
      shellShadow,
      legendBg,
      idleDot,
      // LimelightNav theme tokens
      nav: {
        accent,
        ink,
        mutedInk: isDark ? hexToRgba(ink, 0.48) : hexToRgba(ink, 0.4),
        surface: "transparent",
        border: "transparent",
      },
    };
  }, [background, textColor, accentProp, mutedColor, isDark]);

  // Always 5 tools — gallery is the psychology palette grid
  const items = useMemo(
    () => [
      {
        id: "color",
        label: open?.color ? "Close color palette" : "Open color palette",
        active: Boolean(open?.color),
        icon: <Palette className="w-5 h-5" strokeWidth={1.85} />,
        onClick: () => {
          onFocus?.("color");
          onToggle("color");
        },
      },
      {
        id: "image",
        label: open?.image ? "Close image picker" : "Open image color picker",
        active: Boolean(open?.image),
        icon: <ImageIcon className="w-5 h-5" strokeWidth={1.85} />,
        onClick: () => {
          onFocus?.("image");
          onToggle("image");
        },
      },
      {
        id: "emotion",
        label: open?.emotion
          ? "Close emotion psychology"
          : "Open emotion color psychology",
        active: Boolean(open?.emotion),
        icon: <Heart className="w-5 h-5" strokeWidth={1.85} />,
        onClick: () => {
          onFocus?.("emotion");
          onToggle("emotion");
        },
      },
      {
        id: "gallery",
        label: open?.gallery
          ? "Close psychology palette grid"
          : "Open psychology palette grid",
        active: Boolean(open?.gallery),
        icon: <LayoutGrid className="w-5 h-5" strokeWidth={2} />,
        onClick: () => {
          onFocus?.("gallery");
          onToggle("gallery");
        },
      },
      {
        id: "type",
        label: open?.type ? "Close typography" : "Open typography panel",
        active: Boolean(open?.type),
        icon: <Type className="w-5 h-5" strokeWidth={1.85} />,
        onClick: () => {
          onFocus?.("type");
          onToggle("type");
        },
      },
    ],
    [open, onToggle, onFocus],
  );

  if (hidden) return null;

  return (
    <div
      className="fixed z-[70] left-1/2 bottom-5 -translate-x-1/2 flex flex-col items-center gap-2"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        // CSS hooks for any child that still reads variables
        ["--seeui-dock-accent"]: theme.accent,
        ["--seeui-dock-ink"]: theme.ink,
        ["--seeui-dock-bg"]: theme.bg,
        ["--primary"]: hexToHslComponents(theme.accent),
      }}
    >
      <div
        className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest pointer-events-none transition-colors duration-500"
        style={{
          color: theme.muted,
          background: theme.legendBg,
          border: `1px solid ${theme.shellBorder}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <LayoutTemplate size={10} style={{ color: theme.accent }} />
        Tools · open palettes
      </div>

      <div
        className="rounded-2xl backdrop-blur-xl transition-all duration-500"
        style={{
          background: theme.shellBg,
          border: `1px solid ${theme.shellBorder}`,
          boxShadow: theme.shellShadow,
          color: theme.ink,
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
        }}
      >
        <LimelightNav
          items={items}
          activeIndex={activeIndex}
          onTabChange={(i) => onFocus?.(PANEL_ORDER[i])}
          theme={theme.nav}
          className="h-12 sm:h-14 rounded-2xl border-0 bg-transparent px-0.5"
          iconContainerClassName="p-2.5 sm:p-3"
        />
      </div>

      {/* Labels under dock — includes Psychology Grid */}
      <div
        className="hidden sm:flex items-center justify-center gap-0 pointer-events-none"
        style={{ minWidth: 220 }}
      >
        {PANEL_ORDER.map((id) => {
          const labels = {
            color: "Color",
            image: "Image",
            emotion: "Emotion",
            gallery: "Grid",
            type: "Type",
          };
          const isOn = Boolean(open?.[id]);
          return (
            <span
              key={id}
              className="text-[8px] font-bold uppercase tracking-wider text-center"
              style={{
                width: 44,
                color: isOn ? theme.accent : theme.muted,
                opacity: isOn ? 1 : 0.75,
              }}
            >
              {labels[id]}
            </span>
          );
        })}
      </div>

      {/* Open-state dots — 5 tools including gallery */}
      <div className="flex items-center gap-2 pointer-events-none" aria-hidden>
        {PANEL_ORDER.map((id) => (
          <span
            key={id}
            className="h-1.5 w-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: open?.[id] ? theme.accent : theme.idleDot,
              transform: open?.[id] ? "scale(1.4)" : "scale(1)",
              opacity: open?.[id] ? 1 : 0.7,
              boxShadow: open?.[id]
                ? `0 0 8px ${hexToRgba(theme.accent, 0.65)}`
                : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Color helpers (dock-local, no extra deps) ───────────────────────────────

function normalizeHex(hex) {
  if (!hex || typeof hex !== "string") return null;
  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  if (c.length !== 6 || !/^[0-9a-fA-F]{6}$/i.test(c)) return null;
  return `#${c.toUpperCase()}`;
}

function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return { r: 15, g: 23, b: 42 };
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function hexToRgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function mixToward(hex, toward, t) {
  const a = hexToRgb(hex);
  const b = hexToRgb(toward);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return `#${[m(a.r, b.r), m(a.g, b.g), m(a.b, b.b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function hexToHslComponents(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
    else if (max === gg) h = ((bb - rr) / d + 2) / 6;
    else h = ((rr - gg) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
