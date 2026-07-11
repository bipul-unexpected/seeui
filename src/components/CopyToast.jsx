/**
 * Temporary "Copied!" toast — fixed bottom-center.
 */

import { useEffect } from "react";

export default function CopyToast({ message = "Copied!", visible, onHide }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onHide?.(), 1800);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(16,185,129,0.95))",
          color: "#FFF",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 12px 40px rgba(34,197,94,0.35)",
          animation: "toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {message}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
