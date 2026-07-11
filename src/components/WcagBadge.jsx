/**
 * Dynamic WCAG contrast badge — ratio + Pass/Fail level.
 */

import { useMemo } from "react";
import { getWcagReport } from "../utils/wcagContrast";

/**
 * @param {object} props
 * @param {string} props.textColor
 * @param {string} props.backgroundColor
 * @param {string} [props.fontFamily]
 * @param {'sm'|'md'} [props.size]
 */
export default function WcagBadge({
  textColor,
  backgroundColor,
  fontFamily,
  size = "sm",
}) {
  const report = useMemo(
    () => getWcagReport(textColor, backgroundColor),
    [textColor, backgroundColor],
  );

  const pad = size === "md" ? "px-3 py-1.5 text-[11px]" : "px-2 py-0.5 text-[9px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider ${pad}`}
      style={{
        backgroundColor: `${report.color}22`,
        color: report.color,
        border: `1px solid ${report.color}55`,
        fontFamily,
      }}
      title={`Contrast ${report.ratioLabel} — ${report.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: report.color }}
      />
      <span>{report.ratioLabel}</span>
      <span
        className="rounded px-1 py-px text-[8px] tracking-wide"
        style={{
          backgroundColor: report.color,
          color: "#FFF",
          fontWeight: 900,
        }}
      >
        {report.pass ? `Pass ${report.level}` : report.level === "AA Large" ? "AA Large" : "Fail"}
      </span>
    </span>
  );
}
