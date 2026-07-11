import type React from "react";
import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...(props as any)}
    aria-label="Home"
    fill="none"
    role="img"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...(props as any)}
    aria-label="Explore"
    fill="none"
    role="img"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);
const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...(props as any)}
    aria-label="Notifications"
    fill="none"
    role="img"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export interface NavItem {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  onClick?: () => void;
  /** Soft highlight when this panel/tool is open */
  active?: boolean;
}

/** Live theme tokens so limelight + icons track SeeUI palette */
export interface LimelightTheme {
  /** Spotlight bar + open-state icon accent */
  accent?: string;
  /** Default icon stroke when focused */
  ink?: string;
  /** Dimmed icon stroke when idle */
  mutedInk?: string;
  /** Nav surface (optional; prefer transparent if parent paints glass) */
  surface?: string;
  /** Nav border color */
  border?: string;
}

const defaultNavItems: NavItem[] = [
  { id: "default-home", icon: <DefaultHomeIcon />, label: "Home" },
  { id: "default-explore", icon: <DefaultCompassIcon />, label: "Explore" },
  {
    id: "default-notifications",
    icon: <DefaultBellIcon />,
    label: "Notifications",
  },
];

export interface LimelightNavProps {
  items?: NavItem[];
  /** Uncontrolled initial highlight */
  defaultActiveIndex?: number;
  /** Controlled highlight index */
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  /** Theme colors — always re-applied when palette changes */
  theme?: LimelightTheme;
  style?: React.CSSProperties;
}

export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  activeIndex: activeIndexProp,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
  theme,
  style,
}: LimelightNavProps) => {
  const isControlled = activeIndexProp !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const activeIndex = isControlled ? (activeIndexProp as number) : internalIndex;
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  const accent = theme?.accent || "hsl(var(--primary))";
  const ink = theme?.ink || "currentColor";
  const mutedInk = theme?.mutedInk || theme?.ink || "currentColor";

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];

    if (limelight && activeItem) {
      const newLeft =
        activeItem.offsetLeft +
        activeItem.offsetWidth / 2 -
        limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [activeIndex, isReady, items]);

  // Recalculate on resize
  useEffect(() => {
    const onResize = () => {
      const limelight = limelightRef.current;
      const activeItem = navItemRefs.current[activeIndex];
      if (limelight && activeItem) {
        limelight.style.left = `${
          activeItem.offsetLeft +
          activeItem.offsetWidth / 2 -
          limelight.offsetWidth / 2
        }px`;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    if (!isControlled) setInternalIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav
      aria-label="Tools"
      className={cn(
        "relative inline-flex items-center h-16 rounded-lg border px-2",
        !theme?.surface && "bg-card text-foreground",
        className,
      )}
      style={{
        backgroundColor: theme?.surface,
        borderColor: theme?.border,
        color: ink,
        transition:
          "background-color 0.45s ease, border-color 0.45s ease, color 0.45s ease, box-shadow 0.45s ease",
        ...style,
      }}
    >
      {items.map(({ id, icon, label, onClick, active }, index) => {
        const isFocus = activeIndex === index;
        const isOpen = Boolean(active);
        const isLit = isFocus || isOpen;
        // Focused: full accent; open but not focus: ink; idle: muted
        const iconColor = isFocus ? accent : isOpen ? ink : mutedInk;
        const iconOpacity = isFocus ? 1 : isOpen ? 0.92 : 0.42;

        return (
          <button
            type="button"
            className={cn(
              "relative z-20 flex h-full cursor-pointer items-center justify-center p-5 bg-transparent border-0 appearance-none outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-0 rounded-xl",
              iconContainerClassName,
            )}
            style={
              {
                ["--tw-ring-color" as string]: accent,
              } as React.CSSProperties
            }
            key={id}
            onClick={() => handleItemClick(index, onClick)}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
            aria-label={label || String(id)}
            aria-pressed={Boolean(active)}
            title={label}
          >
            {cloneElement(icon as React.ReactElement<any>, {
              className: cn(
                "w-6 h-6 transition-all duration-200 ease-out",
                (icon.props as any)?.className || "",
                iconClassName || "",
              ),
              style: {
                color: iconColor,
                opacity: iconOpacity,
                transition:
                  "color 0.35s ease, opacity 0.2s ease, transform 0.2s ease",
                transform: isFocus ? "translateY(0.5px) scale(1.05)" : "none",
                ...((icon.props as any)?.style || {}),
              },
              "aria-hidden": true,
            })}
          </button>
        );
      })}

      {/* Limelight spotlight — pure inline colors so theme always wins */}
      <div
        className={cn(
          "absolute top-0 z-10 w-11 h-[5px] rounded-full pointer-events-none",
          isReady ? "transition-[left,background-color,box-shadow] duration-400 ease-in-out" : "",
          limelightClassName,
        )}
        ref={limelightRef}
        style={{
          left: "-999px",
          backgroundColor: accent,
          boxShadow: `0 48px 18px ${withAlpha(accent, 0.42)}`,
        }}
        aria-hidden
      >
        <div
          className="absolute left-[-30%] top-[5px] w-[160%] h-14 pointer-events-none"
          style={{
            clipPath: "polygon(5% 100%, 25% 0, 75% 0, 95% 100%)",
            background: `linear-gradient(to bottom, ${withAlpha(accent, 0.32)}, transparent)`,
          }}
        />
      </div>
    </nav>
  );
};

/** #RGB / #RRGGBB / css color → rgba-ish for glow (hex preferred) */
function withAlpha(color: string, alpha: number): string {
  if (!color || typeof color !== "string") return `rgba(99,102,241,${alpha})`;
  const raw = color.trim();
  if (raw.startsWith("hsl") || raw.startsWith("rgb") || raw.startsWith("var")) {
    // Fallback soft indigo-ish if not hex
    return `color-mix(in srgb, ${raw} ${Math.round(alpha * 100)}%, transparent)`;
  }
  let c = raw.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  if (c.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(c)) {
    return `rgba(99,102,241,${alpha})`;
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
