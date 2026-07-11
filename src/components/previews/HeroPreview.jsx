import { PREVIEW_TRANSITION } from "./previewTheme";

export default function HeroPreview({ theme }) {
  const {
    background,
    text,
    highlight,
    headingFont,
    bodyFont,
    surface,
    border,
    muted,
    radiusPx,
    densityPad,
    shadowCss,
  } = theme;

  return (
    <div
      className={`relative overflow-hidden ${PREVIEW_TRANSITION}`}
      style={{
        backgroundColor: background,
        minHeight: 320,
        borderRadius: radiusPx,
        boxShadow: shadowCss,
        padding: densityPad,
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: highlight }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: highlight }}
      />

      <div className="relative z-10 flex flex-col gap-4 p-2 sm:p-4">
        <span
          className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${PREVIEW_TRANSITION}`}
          style={{
            backgroundColor: `${highlight}22`,
            color: highlight,
            border: `1px solid ${highlight}44`,
            fontFamily: bodyFont,
            borderRadius: "9999px",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: highlight }} />
          Emotion-driven brand
        </span>

        <h2
          className={`max-w-lg text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl ${PREVIEW_TRANSITION}`}
          style={{ color: text, fontFamily: headingFont }}
        >
          Interfaces that feel intentional.
        </h2>

        <p
          className={`max-w-md text-sm leading-relaxed sm:text-[15px] ${PREVIEW_TRANSITION}`}
          style={{ color: muted, fontFamily: bodyFont }}
        >
          Your palette, type, and shape system applied to a marketing hero —
          the first emotional impression users form.
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className={`px-5 py-2.5 text-xs font-bold active:scale-[0.98] ${PREVIEW_TRANSITION}`}
            style={{
              backgroundColor: highlight,
              color: background,
              fontFamily: bodyFont,
              borderRadius: radiusPx,
              boxShadow: `0 10px 28px ${highlight}44`,
            }}
          >
            Get started free
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 text-xs font-semibold ${PREVIEW_TRANSITION}`}
            style={{
              color: text,
              border: `1px solid ${border}`,
              backgroundColor: surface,
              fontFamily: bodyFont,
              borderRadius: radiusPx,
            }}
          >
            Explore product
          </button>
        </div>

        <div
          className={`mt-3 flex flex-wrap items-center gap-4 border-t pt-4 ${PREVIEW_TRANSITION}`}
          style={{ borderColor: border }}
        >
          {["Trusted by teams", "WCAG-aware", "Live tokens"].map((item) => (
            <span
              key={item}
              className="text-[11px] font-medium"
              style={{ color: muted, fontFamily: bodyFont }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
