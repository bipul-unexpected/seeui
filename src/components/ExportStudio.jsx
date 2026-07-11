/**
 * Export Studio — themed modal for full workspace export.
 * Select/deselect sections · code / README (AI) · copy / download · Brand Book PDF.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Download, FileCode2, BookOpen, Sparkles, Trash2 } from "lucide-react";
import {
  EXPORT_SECTIONS,
  DEFAULT_SELECTED,
  EXPORT_FORMATS,
  downloadTextFile,
} from "../utils/exportBundle";
import { copyToClipboard } from "../utils/exportPalette";
import {
  getLatestWorkspaceSnapshot,
  readWorkspaceSnapshot,
} from "../utils/workspaceSnapshotStore";
import { clearAllSeeUIStorage } from "../utils/clearSeeUIStorage";
import BrandBookDownload from "./brandbook/BrandBookDownloadLazy";

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} [props.liveSnapshot] live workspace fields from home
 * @param {(msg: string) => void} [props.onCopied]
 * @param {boolean} [props.isDark]
 * @param {string} [props.background]
 * @param {string} [props.textColor]
 * @param {string} [props.accent]
 * @param {string} [props.mutedColor]
 * @param {string} [props.fontFamily]
 * @param {string} [props.cardBg]
 * @param {string} [props.cardBorder]
 */
export default function ExportStudio({
  open,
  onClose,
  liveSnapshot = {},
  onCopied,
  isDark = true,
  background,
  textColor,
  accent,
  mutedColor,
  fontFamily,
  cardBg,
  cardBorder,
}) {
  const [selected, setSelected] = useState(() => ({ ...DEFAULT_SELECTED }));
  const [formatId, setFormatId] = useState("code");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Freeze snapshot when modal opens so export matches "last work"
  const [frozen, setFrozen] = useState(null);

  useEffect(() => {
    if (!open) return;
    const snap = getLatestWorkspaceSnapshot({
      ...readWorkspaceSnapshot(),
      ...liveSnapshot,
    });
    setFrozen(snap);
    setSelected({ ...DEFAULT_SELECTED });
    setFormatId("code");
    setCopied(false);
    setDownloaded(false);
    // Only re-freeze when the modal opens — not on every liveSnapshot identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // lock body scroll while modal open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const snapshot = frozen || getLatestWorkspaceSnapshot(liveSnapshot);
  const format = EXPORT_FORMATS.find((f) => f.id === formatId) || EXPORT_FORMATS[0];

  const output = useMemo(() => {
    try {
      return format.build(snapshot, selected);
    } catch (err) {
      console.warn(err);
      return `// Export failed: ${err?.message || "unknown error"}`;
    }
  }, [format, snapshot, selected]);

  const theme = useMemo(() => {
    const bg = background || snapshot.background || (isDark ? "#0F172A" : "#F8FAFC");
    const ink = textColor || snapshot.text || (isDark ? "#F8FAFC" : "#0F172A");
    const ac = accent || snapshot.accent || ink;
    const muted =
      mutedColor ||
      (isDark ? "rgba(248,250,252,0.55)" : "rgba(15,23,42,0.5)");
    const panel =
      cardBg ||
      (isDark
        ? "linear-gradient(155deg, rgba(28,28,34,0.98), rgba(14,14,20,0.99))"
        : "linear-gradient(155deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))");
    const border =
      cardBorder ||
      (isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)");
    return { bg, ink, ac, muted, panel, border };
  }, [
    background,
    textColor,
    accent,
    mutedColor,
    cardBg,
    cardBorder,
    isDark,
    snapshot,
  ]);

  const toggle = useCallback((id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const selectAll = useCallback(() => {
    setSelected(
      Object.fromEntries(EXPORT_SECTIONS.map((s) => [s.id, true])),
    );
  }, []);

  const selectNone = useCallback(() => {
    setSelected(
      Object.fromEntries(EXPORT_SECTIONS.map((s) => [s.id, false])),
    );
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      onCopied?.(format.label);
      setTimeout(() => setCopied(false), 1600);
    }
  }, [output, format.label, onCopied]);

  const handleDownload = useCallback(() => {
    const emo = String(snapshot.emotion || "brand")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const date = new Date().toISOString().slice(0, 10);
    const name = `seeui-${emo}-export-${date}.${format.extension}`;
    const ok = downloadTextFile(name, output, format.mime);
    if (ok) {
      setDownloaded(true);
      onCopied?.(`Downloaded ${format.label}`);
      setTimeout(() => setDownloaded(false), 1600);
    }
  }, [output, format, snapshot.emotion, onCopied]);

  if (!open || typeof document === "undefined") return null;

  const selectedCount = EXPORT_SECTIONS.filter((s) => selected[s.id]).length;

  // Portal to <body> so page hero / fade-up transforms cannot stack above the modal
  const modal = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-5"
      style={{
        zIndex: 10000,
        isolation: "isolate",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-studio-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 border-0 cursor-default"
        style={{
          background: isDark ? "rgba(2,6,23,0.78)" : "rgba(15,23,42,0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 0,
        }}
        aria-label="Close export studio"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-3xl max-h-[min(92vh,880px)] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{
          zIndex: 1,
          background: isDark
            ? "linear-gradient(155deg, rgba(22,22,28,0.99) 0%, rgba(12,12,18,1) 100%)"
            : "linear-gradient(155deg, #FFFFFF 0%, #F8FAFC 100%)",
          border: `1px solid ${theme.border}`,
          color: theme.ink,
          boxShadow: `0 32px 100px rgba(0,0,0,0.55), 0 0 0 1px ${theme.border}`,
        }}
      >
        {/* Header — solid surface so nothing bleeds through; title never under close btn */}
        <div
          className="relative shrink-0 px-5 pt-5 pb-4 pr-14"
          style={{
            borderBottom: `1px solid ${theme.border}`,
            background: isDark
              ? "rgba(18,18,24,0.98)"
              : "rgba(255,255,255,0.98)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 transition-opacity hover:opacity-80"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              zIndex: 2,
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="min-w-0 max-w-full">
            <div
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: theme.muted, fontFamily }}
            >
              Export studio · last workspace state
            </div>
            <h2
              id="export-studio-title"
              className="mt-1.5 text-lg sm:text-xl font-extrabold tracking-tight leading-snug"
              style={{ fontFamily, color: theme.ink }}
            >
              Export your full brand system
            </h2>
            <p
              className="mt-1.5 text-[12px] leading-relaxed pr-2"
              style={{ color: theme.muted, fontFamily }}
            >
              Built from localStorage + your last edits ·{" "}
              <span style={{ color: theme.ac, fontWeight: 700 }}>
                {snapshot.emotionLabel || snapshot.emotion}
              </span>
              {" · "}
              {snapshot.updatedAtIso
                ? new Date(snapshot.updatedAtIso).toLocaleString()
                : "now"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto seeui-no-scrollbar px-5 py-4">
          {/* Format tabs */}
          <div
            className="text-[9px] font-black uppercase tracking-widest mb-2"
            style={{ color: theme.muted, fontFamily }}
          >
            Format
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {EXPORT_FORMATS.map((f) => {
              const active = formatId === f.id;
              const Icon =
                f.id === "readme"
                  ? BookOpen
                  : f.id === "code"
                    ? FileCode2
                    : Sparkles;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormatId(f.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all"
                  style={{
                    background: active ? theme.ac : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    color: active ? "#FFFFFF" : theme.ink,
                    border: `1px solid ${active ? theme.ac : theme.border}`,
                    fontFamily,
                    boxShadow: active ? `0 4px 16px ${theme.ac}44` : "none",
                  }}
                >
                  <Icon size={12} />
                  {f.label}
                </button>
              );
            })}
          </div>
          <p
            className="text-[11px] mb-4"
            style={{ color: theme.muted, fontFamily }}
          >
            {format.description}
          </p>

          {/* Section toggles */}
          <div className="flex items-center justify-between mb-2">
            <div
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: theme.muted, fontFamily }}
            >
              Include sections ({selectedCount}/{EXPORT_SECTIONS.length})
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[10px] font-bold underline-offset-2 hover:underline"
                style={{ color: theme.ac, fontFamily }}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="text-[10px] font-bold underline-offset-2 hover:underline"
                style={{ color: theme.muted, fontFamily }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {EXPORT_SECTIONS.map((sec) => {
              const on = Boolean(selected[sec.id]);
              // CSS/Tailwind formats don't use section matrix the same way — still show for code/readme
              const disabled =
                formatId === "css" || formatId === "tailwind"
                  ? sec.id !== "tokens" &&
                    sec.id !== "tailwind" &&
                    sec.id !== "palette" &&
                    sec.id !== "scale" &&
                    sec.id !== "typography"
                  : false;
              return (
                <label
                  key={sec.id}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all"
                  style={{
                    background: on
                      ? isDark
                        ? `${theme.ac}18`
                        : `${theme.ac}14`
                      : isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.03)",
                    border: `1px solid ${on ? theme.ac + "55" : theme.border}`,
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={disabled}
                    onChange={() => toggle(sec.id)}
                    className="mt-0.5 accent-current"
                    style={{ accentColor: theme.ac }}
                  />
                  <span className="min-w-0">
                    <span
                      className="block text-[12px] font-bold"
                      style={{ color: theme.ink, fontFamily }}
                    >
                      {sec.label}
                    </span>
                    <span
                      className="block text-[10px] mt-0.5"
                      style={{ color: theme.muted, fontFamily }}
                    >
                      {sec.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {/* Live palette chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { label: "BG", hex: snapshot.background },
              { label: "Text", hex: snapshot.text },
              { label: "Accent", hex: snapshot.accent },
            ].map((c) => (
              <div
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  fontFamily,
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: `inset 0 0 0 1px ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                  }}
                />
                {c.label} {c.hex}
              </div>
            ))}
          </div>

          {/* Code preview */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: isDark ? "#0B1220" : "#0F172A",
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-[10px] font-mono"
                style={{ color: "rgba(226,232,240,0.55)" }}
              >
                preview · {format.extension} · {selectedCount} sections
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "rgba(148,163,184,0.9)" }}
              >
                {output.length.toLocaleString()} chars
              </span>
            </div>
            <pre
              className="p-3 max-h-[220px] overflow-auto seeui-no-scrollbar text-[10px] sm:text-[11px] leading-relaxed font-mono"
              style={{ color: "#E2E8F0", margin: 0 }}
            >
              <code>{output}</code>
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="shrink-0 flex flex-wrap items-center gap-2 px-5 py-4"
          style={{
            borderTop: `1px solid ${theme.border}`,
            background: isDark
              ? "rgba(18,18,24,0.98)"
              : "rgba(255,255,255,0.98)",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-all active:scale-95"
            style={{
              backgroundColor: theme.ac,
              color: "#FFFFFF",
              fontFamily,
              boxShadow: `0 6px 20px ${theme.ac}44`,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy export"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-all active:scale-95"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontFamily,
            }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            {downloaded ? "Saved" : `Download .${format.extension}`}
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => {
              const ok = window.confirm(
                "Delete ALL SeeUI localStorage data (palettes, history, fonts, logo)? This cannot be undone.",
              );
              if (!ok) return;
              clearAllSeeUIStorage();
              onCopied?.("All saved data deleted");
              onClose?.();
              window.setTimeout(() => window.location.reload(), 350);
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition-all active:scale-95"
            style={{
              background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
              color: isDark ? "#FCA5A5" : "#DC2626",
              border: `1px solid ${isDark ? "rgba(248,113,113,0.35)" : "rgba(239,68,68,0.25)"}`,
              fontFamily,
            }}
            title="Clear all SeeUI localStorage"
          >
            <Trash2 size={13} />
            Delete all data
          </button>

          <BrandBookDownload
            snapshot={snapshot}
            fontFamily={fontFamily}
            buttonBg={isDark ? "rgba(99,102,241,0.25)" : "rgba(79,70,229,0.12)"}
            buttonColor={isDark ? "#C7D2FE" : "#4338CA"}
            borderColor={isDark ? "rgba(165,180,252,0.35)" : "rgba(99,102,241,0.3)"}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
