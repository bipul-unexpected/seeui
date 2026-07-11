/**
 * Export trigger — opens Export Studio popup (full workspace export).
 */

import { useState } from "react";
import ExportStudio from "./ExportStudio";

const IconExport = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/**
 * @param {object} props
 * @param {object} props.palette — live workspace snapshot fields
 * @param {(msg: string) => void} [props.onCopied]
 * @param {string} [props.fontFamily]
 * @param {string} [props.buttonBg]
 * @param {string} [props.buttonColor]
 * @param {string} [props.borderColor]
 * @param {boolean} [props.isDark]
 * @param {string} [props.mutedColor]
 * @param {string} [props.cardBg]
 * @param {string} [props.cardBorder]
 * @param {string} [props.label] button label
 */
export default function ExportPaletteMenu({
  palette,
  onCopied,
  fontFamily,
  buttonBg,
  buttonColor,
  borderColor,
  isDark,
  mutedColor,
  cardBg,
  cardBorder,
  label = "Export",
}) {
  const [open, setOpen] = useState(false);

  const dark =
    isDark != null
      ? isDark
      : palette?.isDark != null
        ? palette.isDark
        : true;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95"
        style={{
          backgroundColor: buttonBg,
          color: buttonColor,
          border: `1px solid ${borderColor}`,
          fontFamily,
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconExport />
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <ExportStudio
        open={open}
        onClose={() => setOpen(false)}
        liveSnapshot={palette || {}}
        onCopied={onCopied}
        isDark={dark}
        background={palette?.background}
        textColor={palette?.text}
        accent={palette?.accent || palette?.highlight}
        mutedColor={mutedColor}
        fontFamily={fontFamily}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />
    </>
  );
}
