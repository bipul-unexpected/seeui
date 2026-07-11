import { useState } from "react";
import { PREVIEW_TRANSITION } from "./previewTheme";

export default function LoginFormPreview({ theme }) {
  const {
    background,
    text,
    highlight,
    headingFont,
    bodyFont,
    surface,
    border,
    muted,
    inputBg,
    radiusPx,
    shadowCss,
  } = theme;

  const [focused, setFocused] = useState(null);
  const [remember, setRemember] = useState(true);

  const fieldStyle = (id) => ({
    backgroundColor: inputBg,
    color: text,
    border: `1.5px solid ${focused === id ? highlight : border}`,
    boxShadow: focused === id ? `0 0 0 3px ${highlight}28` : "none",
    fontFamily: bodyFont,
    outline: "none",
    borderRadius: radiusPx,
  });

  return (
    <div
      className={`flex items-center justify-center p-5 sm:p-8 ${PREVIEW_TRANSITION}`}
      style={{ backgroundColor: background, minHeight: 340 }}
    >
      <div
        className={`w-full max-w-[340px] p-5 sm:p-6 ${PREVIEW_TRANSITION}`}
        style={{
          backgroundColor: surface,
          border: `1px solid ${border}`,
          borderRadius: radiusPx,
          boxShadow: shadowCss || `0 20px 50px ${highlight}14`,
        }}
      >
        <div className="mb-5 text-center">
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-sm font-black"
            style={{
              backgroundColor: highlight,
              color: background,
              borderRadius: radiusPx,
            }}
          >
            S
          </div>
          <h3 className="text-lg font-extrabold" style={{ color: text, fontFamily: headingFont }}>
            Welcome back
          </h3>
          <p className="mt-1 text-[11px]" style={{ color: muted, fontFamily: bodyFont }}>
            Sign in to continue securely
          </p>
        </div>

        <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: muted, fontFamily: bodyFont }}>
              Email
            </span>
            <input
              type="email"
              placeholder="you@company.com"
              className={`px-3 py-2.5 text-xs ${PREVIEW_TRANSITION}`}
              style={fieldStyle("email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: muted, fontFamily: bodyFont }}>
              Password
            </span>
            <input
              type="password"
              placeholder="••••••••"
              className={`px-3 py-2.5 text-xs ${PREVIEW_TRANSITION}`}
              style={fieldStyle("password")}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
          </label>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-[11px]" style={{ color: muted, fontFamily: bodyFont }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((v) => !v)}
                className={`flex h-3.5 w-3.5 items-center justify-center ${PREVIEW_TRANSITION}`}
                style={{
                  backgroundColor: remember ? highlight : "transparent",
                  border: `1.5px solid ${remember ? highlight : border}`,
                  color: background,
                  fontSize: 9,
                  borderRadius: "4px",
                }}
              >
                {remember ? "✓" : ""}
              </button>
              Remember me
            </label>
            <button type="button" className="text-[11px] font-semibold" style={{ color: highlight, fontFamily: bodyFont }}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className={`mt-1 w-full py-2.5 text-xs font-bold active:scale-[0.98] ${PREVIEW_TRANSITION}`}
            style={{
              backgroundColor: highlight,
              color: background,
              fontFamily: bodyFont,
              borderRadius: radiusPx,
              boxShadow: `0 8px 24px ${highlight}40`,
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
