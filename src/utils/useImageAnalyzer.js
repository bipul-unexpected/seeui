/**
 * useImageAnalyzer — upload validation, color extraction, emotion analysis.
 *
 * status: 'idle' | 'dragging' | 'processing' | 'success' | 'error'
 */

import { useCallback, useRef, useState } from "react";
import { extractPaletteFromImage } from "./colorMath";
import { analyzeEmotion } from "./analyzeEmotion";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_LABEL = "JPG, PNG, or WEBP";

/**
 * @param {File} file
 * @returns {string|null} error message or null if valid
 */
export function validateImageFile(file) {
  if (!file) return "No file selected.";
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Only ${ACCEPTED_LABEL} images are allowed.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

/**
 * @param {{ maxColors?: number }} [options]
 */
export function useImageAnalyzer(options = {}) {
  const { maxColors = 5 } = options;

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [extractedColors, setExtractedColors] = useState([]);
  const [emotionResult, setEmotionResult] = useState(null);
  const [fileName, setFileName] = useState("");

  const objectUrlRef = useRef(null);

  const revokePreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    revokePreview();
    setStatus("idle");
    setErrorMsg("");
    setPreviewUrl("");
    setExtractedColors([]);
    setEmotionResult(null);
    setFileName("");
  }, [revokePreview]);

  const setDragging = useCallback((isDragging) => {
    setStatus((prev) => {
      if (prev === "processing" || prev === "success") return prev;
      return isDragging ? "dragging" : prev === "dragging" ? "idle" : prev;
    });
  }, []);

  const analyzeFile = useCallback(
    async (file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setStatus("error");
        setErrorMsg(validationError);
        return;
      }

      revokePreview();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setFileName(file.name || "image");
      setStatus("processing");
      setErrorMsg("");
      setExtractedColors([]);
      setEmotionResult(null);

      try {
        // Yield to paint loading UI before heavy canvas work
        await new Promise((r) => setTimeout(r, 40));

        const colors = await extractPaletteFromImage(url, {
          maxColors,
          maxSize: 150,
        });
        const emotion = analyzeEmotion(colors);

        setExtractedColors(colors);
        setEmotionResult(emotion);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(
          err?.message || "Analysis failed. Try another image.",
        );
        setExtractedColors([]);
        setEmotionResult(null);
      }
    },
    [maxColors, revokePreview],
  );

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      analyzeFile(file);
    },
    [analyzeFile],
  );

  return {
    status,
    errorMsg,
    previewUrl,
    extractedColors,
    emotionResult,
    fileName,
    setDragging,
    handleFiles,
    analyzeFile,
    reset,
    // constants for UI
    maxFileBytes: MAX_FILE_BYTES,
    acceptedTypes: ACCEPTED_TYPES,
    acceptedLabel: ACCEPTED_LABEL,
  };
}

export default useImageAnalyzer;
