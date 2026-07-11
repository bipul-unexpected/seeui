/**
 * Image to Emotion Extractor — premium upload → palette → psychology result.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Wand2,
} from "lucide-react";
import {
  useImageAnalyzer,
  ACCEPTED_TYPES,
  ACCEPTED_LABEL,
  MAX_FILE_BYTES,
} from "../utils/useImageAnalyzer";
import { savePreviewToHistory } from "../utils/workspaceApply";

function copyText(text) {
  return navigator.clipboard?.writeText(text).catch(() => false);
}

/**
 * @param {object} props
 * @param {(palette: { background: string, text: string, accent: string, emotion?: string }) => void} [props.onApplyPalette]
 * @param {string} [props.cardBg]
 * @param {string} [props.cardBorder]
 * @param {string} [props.mutedColor]
 * @param {string} [props.textColor]
 * @param {string} [props.fontFamily]
 * @param {boolean} [props.isDark]
 * @param {string} [props.accent]
 */
export default function ImageEmotionExtractor({
  onApplyPalette,
  cardBg = "rgba(255,255,255,0.06)",
  cardBorder = "rgba(255,255,255,0.1)",
  mutedColor = "rgba(255,255,255,0.55)",
  textColor = "#F8FAFC",
  fontFamily = "'Inter', system-ui, sans-serif",
  isDark = true,
  accent = "#818CF8",
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const [copiedHex, setCopiedHex] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    status,
    errorMsg,
    previewUrl,
    extractedColors,
    emotionResult,
    fileName,
    setDragging,
    handleFiles,
    reset,
  } = useImageAnalyzer({ maxColors: 5 });

  const showToast = useCallback((msg, type = "error") => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (status === "error" && errorMsg) showToast(errorMsg, "error");
  }, [status, errorMsg, showToast]);

  // Auto-save successful analysis into shared history
  useEffect(() => {
    if (status !== "success" || !emotionResult?.suggestedPalette) return;
    savePreviewToHistory(
      {
        ...emotionResult.suggestedPalette,
        emotion: emotionResult.emotionId,
        label: emotionResult.emotionName || "Image emotion",
      },
      { source: "extract", label: emotionResult.emotionName || "Image extract" },
    );
  }, [status, emotionResult]);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFiles(e.dataTransfer?.files);
  };

  const openPicker = () => inputRef.current?.click();

  const onKeyActivate = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const handleCopyHex = async (hex) => {
    const ok = await copyText(hex);
    if (ok !== false) {
      setCopiedHex(hex);
      showToast(`Copied ${hex}`, "success");
      setTimeout(() => setCopiedHex(null), 1400);
    }
  };

  const handleApply = () => {
    if (!emotionResult?.suggestedPalette) return;
    onApplyPalette?.({
      ...emotionResult.suggestedPalette,
      emotion: emotionResult.emotionId,
      label: emotionResult.emotionName,
    });
    showToast("Palette applied to workspace", "success");
  };

  const isDragging = status === "dragging";
  const isProcessing = status === "processing";
  const isSuccess = status === "success";

  return (
    <section
      className="rounded-2xl p-5 sm:p-6 transition-colors duration-500"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[9.5px] font-black uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily }}
            >
              Image → Emotion
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{
                background: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}44`,
                fontFamily,
              }}
            >
              Canvas AI · no upload server
            </span>
          </div>
          <h2
            className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl"
            style={{ color: textColor, fontFamily }}
          >
            Extract emotion from any image
          </h2>
          <p
            className="mt-1 max-w-xl text-xs leading-relaxed"
            style={{ color: mutedColor, fontFamily }}
          >
            Drop a photo. We downscale it locally, pull 3–5 dominant colors, and
            map HSL psychology to a primary emotion + type pairing.
          </p>
        </div>
        {(previewUrl || status === "error") && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all active:scale-95"
            style={{
              color: mutedColor,
              border: `1px solid ${cardBorder}`,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              fontFamily,
            }}
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Drop zone / preview */}
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {!previewUrl ? (
            <div
              ref={dropRef}
              role="button"
              tabIndex={0}
              aria-label={`Upload image. Accepts ${ACCEPTED_LABEL}, max 5MB.`}
              aria-describedby={`${inputId}-hint`}
              onClick={openPicker}
              onKeyDown={onKeyActivate}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl px-6 py-10 text-center outline-none transition-all duration-300 focus-visible:ring-2"
              style={{
                background: isDragging
                  ? `${accent}14`
                  : isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px dashed ${isDragging ? accent : cardBorder}`,
                boxShadow: isDragging ? `0 0 0 4px ${accent}22` : "none",
                // focus ring via boxShadow on focus-visible handled by class + style
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}44`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = isDragging
                  ? `0 0 0 4px ${accent}22`
                  : "none";
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accent}33, ${accent}18)`,
                  border: `1px solid ${accent}40`,
                  color: accent,
                }}
              >
                {isDragging ? <Upload size={22} /> : <ImageIcon size={22} />}
              </div>
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ color: textColor, fontFamily }}
                >
                  {isDragging ? "Drop to analyze" : "Drag & drop an image"}
                </div>
                <p
                  id={`${inputId}-hint`}
                  className="mt-1 text-[11px]"
                  style={{ color: mutedColor, fontFamily }}
                >
                  or click / press Enter · {ACCEPTED_LABEL} · max{" "}
                  {Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB
                </p>
              </div>
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                border: `1px solid ${cardBorder}`,
                background: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.04)",
                minHeight: 260,
              }}
            >
              <img
                src={previewUrl}
                alt={fileName || "Uploaded preview"}
                className="h-full max-h-[360px] w-full object-contain transition-opacity duration-500"
                style={{
                  opacity: isProcessing ? 0.45 : 1,
                  animation: "imgFadeIn 0.45s ease both",
                }}
              />

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 backdrop-blur-[2px]">
                  <div className="relative h-16 w-16">
                    <div
                      className="absolute inset-0 rounded-full opacity-60"
                      style={{
                        border: `2px solid ${accent}`,
                        animation: "scanPulse 1.4s ease-in-out infinite",
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${accent}55, transparent)`,
                        animation: "scanSweep 1.6s linear infinite",
                      }}
                    />
                    <Sparkles
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "#FFF" }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">
                      Scanning image…
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/70">
                      Downscaling · sampling pixels · mapping HSL emotion
                    </div>
                  </div>
                  {/* Skeleton bars */}
                  <div className="mt-2 flex w-48 gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-8 flex-1 rounded-md bg-white/15"
                        style={{
                          animation: `skel 1.2s ease-in-out ${i * 0.08}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex min-h-[260px] flex-col gap-3">
          {!isSuccess && !isProcessing && (
            <div
              className="flex flex-1 flex-col items-center justify-center rounded-2xl px-6 py-10 text-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px dashed ${cardBorder}`,
              }}
            >
              <Wand2 size={22} style={{ color: accent, opacity: 0.8 }} />
              <p
                className="mt-3 max-w-xs text-xs leading-relaxed"
                style={{ color: mutedColor, fontFamily }}
              >
                Results appear here — dominant palette, emotion card, and
                recommended typography after analysis.
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-1 flex-col gap-3">
              <div
                className="h-24 animate-pulse rounded-2xl"
                style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
              />
              <div
                className="flex-1 animate-pulse rounded-2xl"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
              />
            </div>
          )}

          {isSuccess && emotionResult && (
            <>
              {/* Palette row */}
              <div
                className="rounded-2xl p-3"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <div
                  className="mb-2 text-[9px] font-black uppercase tracking-widest"
                  style={{ color: mutedColor, fontFamily }}
                >
                  Extracted palette · {extractedColors.length} colors
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedColors.map((c) => (
                    <button
                      key={c.hex + c.role}
                      type="button"
                      onClick={() => handleCopyHex(c.hex)}
                      className="group relative flex flex-col overflow-hidden rounded-xl transition-transform active:scale-95"
                      style={{
                        width: 72,
                        border: `1px solid ${cardBorder}`,
                      }}
                      title={`Copy ${c.hex}`}
                    >
                      <div className="h-10 w-full" style={{ backgroundColor: c.hex }} />
                      <div
                        className="flex items-center justify-between gap-1 px-1.5 py-1"
                        style={{
                          background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          className="truncate text-[8px] font-mono font-bold"
                          style={{ color: textColor }}
                        >
                          {copiedHex === c.hex ? "Copied" : c.hex}
                        </span>
                        {copiedHex === c.hex ? (
                          <Check size={10} style={{ color: "#34D399" }} />
                        ) : (
                          <Copy size={10} style={{ color: mutedColor }} />
                        )}
                      </div>
                      {/* Hover tooltip */}
                      <span
                        className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
                        style={{
                          background: "rgba(15,23,42,0.92)",
                          color: "#E0E7FF",
                          border: "1px solid rgba(129,140,248,0.4)",
                        }}
                      >
                        Click to copy
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotion result card */}
              <div
                className="relative flex-1 overflow-hidden rounded-2xl p-4 sm:p-5"
                style={{
                  background: isDark
                    ? `linear-gradient(145deg, ${accent}18, rgba(15,15,22,0.9))`
                    : `linear-gradient(145deg, ${accent}12, rgba(255,255,255,0.95))`,
                  border: `1px solid ${accent}40`,
                  boxShadow: `0 16px 40px ${accent}15`,
                }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
                  style={{ backgroundColor: accent }}
                />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: `${accent}28`,
                        color: accent,
                        fontFamily,
                      }}
                    >
                      Primary emotion
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: mutedColor, fontFamily }}
                    >
                      {Math.round((emotionResult.confidence || 0) * 100)}%
                      confidence
                    </span>
                  </div>
                  <h3
                    className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl"
                    style={{ color: textColor, fontFamily }}
                  >
                    {emotionResult.emotionName}
                  </h3>
                  <p
                    className="mt-2 text-[12px] leading-relaxed sm:text-[13px]"
                    style={{ color: mutedColor, fontFamily }}
                  >
                    {emotionResult.psychologySummary}
                  </p>

                  <div
                    className="mt-4 rounded-xl p-3"
                    style={{
                      background: isDark
                        ? "rgba(0,0,0,0.25)"
                        : "rgba(255,255,255,0.65)",
                      border: `1px solid ${cardBorder}`,
                    }}
                  >
                    <div
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: mutedColor, fontFamily }}
                    >
                      Recommended typography
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className="text-[14px] font-bold"
                        style={{
                          color: textColor,
                          fontFamily:
                            emotionResult.recommendedTypography?.headingFamily ||
                            fontFamily,
                        }}
                      >
                        {emotionResult.recommendedTypography?.heading}
                      </span>
                      <span style={{ color: mutedColor }}>+</span>
                      <span
                        className="text-[13px] font-semibold"
                        style={{
                          color: textColor,
                          fontFamily:
                            emotionResult.recommendedTypography?.bodyFamily ||
                            fontFamily,
                        }}
                      >
                        {emotionResult.recommendedTypography?.body}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: mutedColor, fontFamily }}>
                      Heading · Body pairing for this emotional profile
                    </div>
                  </div>

                  {typeof onApplyPalette === "function" && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.99] sm:w-auto sm:px-5"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        color: isDark ? "#0A0A0A" : "#FFF",
                        fontFamily,
                        boxShadow: `0 8px 24px ${accent}40`,
                      }}
                    >
                      <Wand2 size={14} />
                      Apply palette to workspace
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2"
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl"
            style={{
              background:
                toast.type === "success"
                  ? "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(16,185,129,0.95))"
                  : "linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.92))",
              color: "#FFF",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: "toastPop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {toast.type === "success" ? (
              <Check size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {toast.msg}
          </div>
        </div>
      )}

      <style>{`
        @keyframes imgFadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scanPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes scanSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes skel {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        @keyframes toastPop {
          from { opacity: 0; transform: translateY(10px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  );
}
