import { PREVIEW_TRANSITION } from "./previewTheme";

const NAV = [
  { id: "overview", label: "Overview", active: true },
  { id: "users", label: "Users", active: false },
  { id: "billing", label: "Billing", active: false },
  { id: "settings", label: "Settings", active: false },
];

const STATS = [
  { label: "Total Users", value: "12,480", delta: "+12.4%" },
  { label: "Revenue", value: "$48.2k", delta: "+8.1%" },
  { label: "Sessions", value: "94.3k", delta: "+3.2%" },
];

const BARS = [42, 65, 48, 78, 55, 90, 62, 70, 58, 84, 72, 68];

export default function DashboardPreview({ theme }) {
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
    isDarkBg,
    radiusPx,
    shadowCss,
  } = theme;

  const sidebarBg = isDarkBg ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.03)";

  return (
    <div
      className={`overflow-hidden ${PREVIEW_TRANSITION}`}
      style={{
        backgroundColor: background,
        border: `1px solid ${border}`,
        minHeight: 320,
        borderRadius: radiusPx,
        boxShadow: shadowCss,
      }}
    >
      <div className="flex min-h-[320px]">
        <aside
          className={`hidden w-[128px] shrink-0 flex-col gap-1 border-r p-3 sm:flex ${PREVIEW_TRANSITION}`}
          style={{ backgroundColor: sidebarBg, borderColor: border }}
        >
          <div className="mb-3 flex items-center gap-1.5 px-1.5">
            <div
              className="flex h-6 w-6 items-center justify-center text-[10px] font-black"
              style={{
                backgroundColor: highlight,
                color: background,
                borderRadius: "8px",
              }}
            >
              S
            </div>
            <span className="text-[11px] font-bold" style={{ color: text, fontFamily: headingFont }}>
              Admin
            </span>
          </div>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`px-2.5 py-1.5 text-left text-[10px] font-semibold ${PREVIEW_TRANSITION}`}
              style={{
                backgroundColor: item.active ? `${highlight}22` : "transparent",
                color: item.active ? highlight : muted,
                border: item.active ? `1px solid ${highlight}44` : "1px solid transparent",
                fontFamily: bodyFont,
                borderRadius: radiusPx,
              }}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`flex items-center justify-between border-b px-3 py-2.5 sm:px-4 ${PREVIEW_TRANSITION}`}
            style={{ borderColor: border, backgroundColor: surface }}
          >
            <span className="text-[11px] font-bold sm:text-xs" style={{ color: text, fontFamily: headingFont }}>
              Analytics
            </span>
            <div className="flex items-center gap-2">
              <div
                className="hidden px-2.5 py-1 text-[10px] sm:block"
                style={{
                  backgroundColor: surfaceStrong,
                  color: muted,
                  border: `1px solid ${border}`,
                  fontFamily: bodyFont,
                  borderRadius: radiusPx,
                }}
              >
                Search…
              </div>
              <div
                className="flex h-7 w-7 items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: highlight,
                  color: background,
                  borderRadius: "9999px",
                }}
              >
                AR
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className={`p-2.5 sm:p-3 ${PREVIEW_TRANSITION}`}
                  style={{
                    backgroundColor: surface,
                    border: `1px solid ${border}`,
                    borderRadius: radiusPx,
                  }}
                >
                  <div className="text-[8px] font-bold uppercase tracking-wider sm:text-[9px]" style={{ color: muted, fontFamily: bodyFont }}>
                    {stat.label}
                  </div>
                  <div className="mt-1 text-sm font-extrabold sm:text-base" style={{ color: text, fontFamily: headingFont }}>
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9px] font-semibold" style={{ color: highlight, fontFamily: bodyFont }}>
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`flex flex-1 flex-col p-3 ${PREVIEW_TRANSITION}`}
              style={{
                backgroundColor: surface,
                border: `1px solid ${border}`,
                minHeight: 120,
                borderRadius: radiusPx,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold" style={{ color: text, fontFamily: headingFont }}>
                  Weekly traffic
                </span>
                <span
                  className="px-2 py-0.5 text-[8px] font-bold"
                  style={{
                    backgroundColor: `${highlight}22`,
                    color: highlight,
                    fontFamily: bodyFont,
                    borderRadius: "9999px",
                  }}
                >
                  Live
                </span>
              </div>
              <div className="flex flex-1 items-end gap-1 sm:gap-1.5">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className={`min-w-0 flex-1 rounded-t-sm ${PREVIEW_TRANSITION}`}
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === BARS.length - 2 ? highlight : `${highlight}66`,
                      opacity: i === BARS.length - 2 ? 1 : 0.55,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
