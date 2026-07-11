import { PREVIEW_TRANSITION } from "./previewTheme";

export default function ProductCardPreview({ theme }) {
  const {
    background,
    text,
    highlight,
    headingFont,
    bodyFont,
    surface,
    surfaceStrong,
    border,
    muted,
    radiusPx,
    shadowCss,
  } = theme;

  return (
    <div
      className={`flex items-center justify-center p-5 sm:p-8 ${PREVIEW_TRANSITION}`}
      style={{ backgroundColor: background, minHeight: 340 }}
    >
      <article
        className={`w-full max-w-[300px] overflow-hidden ${PREVIEW_TRANSITION}`}
        style={{
          backgroundColor: surface,
          border: `1px solid ${border}`,
          borderRadius: radiusPx,
          boxShadow: shadowCss || `0 16px 48px ${highlight}18`,
        }}
      >
        <div
          className={`relative flex h-40 items-center justify-center ${PREVIEW_TRANSITION}`}
          style={{ backgroundColor: surfaceStrong }}
        >
          <div
            className="absolute left-3 top-3 px-2 py-0.5 text-[9px] font-bold"
            style={{
              backgroundColor: highlight,
              color: background,
              fontFamily: bodyFont,
              borderRadius: "9999px",
            }}
          >
            −20%
          </div>
          <div
            className="h-20 w-20 opacity-90"
            style={{
              background: `linear-gradient(135deg, ${highlight}, ${highlight}66)`,
              boxShadow: `0 12px 32px ${highlight}44`,
              borderRadius: radiusPx,
            }}
          />
        </div>

        <div className="flex flex-col gap-2 p-4">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: highlight, fontFamily: bodyFont }}>
            Essentials
          </span>
          <h3 className="text-base font-bold leading-snug" style={{ color: text, fontFamily: headingFont }}>
            Soft Form Chair
          </h3>
          <p className="text-[11px] leading-relaxed" style={{ color: muted, fontFamily: bodyFont }}>
            Minimal seating designed for calm, focused workspaces.
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="text-[11px]" style={{ color: n <= 4 ? highlight : muted }}>
                ★
              </span>
            ))}
            <span className="ml-1 text-[10px]" style={{ color: muted, fontFamily: bodyFont }}>
              4.0 · 128 reviews
            </span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-extrabold" style={{ color: text, fontFamily: headingFont }}>
              $189
            </span>
            <span className="ml-1.5 text-[11px] line-through" style={{ color: muted, fontFamily: bodyFont }}>
              $236
            </span>
          </div>
          <button
            type="button"
            className={`mt-1 w-full py-2.5 text-xs font-bold active:scale-[0.98] ${PREVIEW_TRANSITION}`}
            style={{
              backgroundColor: highlight,
              color: background,
              fontFamily: bodyFont,
              borderRadius: radiusPx,
              boxShadow: `0 6px 20px ${highlight}40`,
            }}
          >
            Add to Cart
          </button>
        </div>
      </article>
    </div>
  );
}
