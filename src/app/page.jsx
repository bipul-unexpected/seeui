import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Heart, Github, LayoutGrid } from "lucide-react";
import ColorBoard from "../components/ColorBoard";
import TypographyBoard from "../components/TypographyBoard";
import ImageColorPicker from "../components/ImageColorPicker";
import EmotionColorBoard from "../components/EmotionColorBoard";
import ColorPaletteGallery from "../components/ColorPaletteGallery";
import CustomCursor from "../components/CustomCursor";
import RecentPalettes from "../components/RecentPalettes";
import CopyToast from "../components/CopyToast";
import WcagBadge from "../components/WcagBadge";
import ExportPaletteMenu from "../components/ExportPaletteMenu";
import BrandBookDownload from "../components/brandbook/BrandBookDownloadLazy";
import ColorScaleGrid from "../components/ColorScaleGrid";
import PanelDock from "../components/PanelDock";
import PsychologyNav from "../components/PsychologyNav";
import ImageEmotionExtractor from "../components/ImageEmotionExtractor";
import DonateModal from "../components/DonateModal";
import SiteLoader from "../components/SiteLoader";
import { Link } from "react-router";
import StudioJourneyCards from "../components/StudioJourneyCards";
import { buildJsonLdGraph } from "../data/seo";
import FONTS, {
  DEFAULT_FONT,
  RANDOM_DEFAULTS,
  buildGoogleFontsUrl,
} from "../data/fonts";
import {
  readCustomFonts,
  registerAllCustomFonts,
} from "../utils/customFontsStore";
import {
  getContrastColor,
  getMutedContrastColor,
} from "../utils/getContrastColor";
import { getWcagReport } from "../utils/wcagContrast";
import { useRecentPalettes } from "../utils/useRecentPalettes";
import { useDynamicFonts } from "../utils/useDynamicFonts";
import TypographyPairBadge from "../components/TypographyPairBadge";
import {
  ACTIVE_PALETTE_KEY,
  paletteSignature,
  writeActivePalette,
} from "../utils/activePaletteStore";
import {
  writeWorkspaceSnapshot,
  readWorkspaceSnapshot,
} from "../utils/workspaceSnapshotStore";
import { applyToWorkspace } from "../utils/workspaceApply";
import { clearAllSeeUIStorage } from "../utils/clearSeeUIStorage";

const GOOGLE_FONTS_HREF = buildGoogleFontsUrl();

export default function HomePage() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Random default bg on each load — initialiser runs once per client mount
  const [bgColor, setBgColor] = useState(
    () => RANDOM_DEFAULTS[Math.floor(Math.random() * RANDOM_DEFAULTS.length)],
  );
  const [textColor, setTextColor] = useState(() => getContrastColor(bgColor));
  const [textIsAuto, setTextIsAuto] = useState(true);

  // Typography state
  const [fontSlug, setFontSlug] = useState(DEFAULT_FONT.slug);
  const [fontWeight, setFontWeight] = useState(700);
  const [fontSize, setFontSize] = useState(56);
  const [customFonts, setCustomFonts] = useState(() => readCustomFonts());

  // Rehydrate uploaded fonts after reload
  useEffect(() => {
    registerAllCustomFonts(customFonts);
  }, [customFonts]);

  const allFonts = useMemo(
    () => [...(customFonts || []), ...FONTS],
    [customFonts],
  );

  const activeFont = useMemo(
    () => allFonts.find((f) => f.slug === fontSlug) || DEFAULT_FONT,
    [allFonts, fontSlug],
  );
  const fontFamily = activeFont.family;

  // UI state
  const [copied, setCopied] = useState(false);
  // Logo restored from localStorage workspace snapshot when available
  const [logoUrl, setLogoUrl] = useState(() => {
    try {
      const snap = readWorkspaceSnapshot();
      if (snap?.logoUrl) return snap.logoUrl;
    } catch {
      /* ignore */
    }
    return null;
  });
  const logoInputRef = useRef(null);

  // Optional accent from emotion / gallery palette (used on primary CTA)
  const [accentHex, setAccentHex] = useState(null);
  const [galleryActiveId, setGalleryActiveId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  /** Drives emotion typography pair (heading + body) for Live Preview + export */
  const [activeEmotion, setActiveEmotion] = useState("trust");
  /** When true, page hero/body use emotion type pair; Typography panel unlocks this */
  const [emotionTypeActive, setEmotionTypeActive] = useState(true);

  /**
   * Floating palette open state (Limelight PanelDock).
   * open.* true = panel visible; minimized props are inverted.
   */
  const [panelOpen, setPanelOpen] = useState({
    color: true,
    image: false,
    emotion: false,
    gallery: false, // psychology palette grid
    type: true,
  });
  const [panelFocus, setPanelFocus] = useState(
    /** @type {'color'|'image'|'emotion'|'gallery'|'type'} */ ("color"),
  );

  const togglePanel = useCallback((id) => {
    setPanelOpen((prev) => {
      const nextOpen = !prev[id];
      if (nextOpen) setPanelFocus(id);
      return { ...prev, [id]: nextOpen };
    });
  }, []);

  const setPanelMinimized = useCallback((id, minimized) => {
    setPanelOpen((prev) => {
      const nextOpen = !minimized;
      if (nextOpen) setPanelFocus(id);
      return { ...prev, [id]: nextOpen };
    });
  }, []);

  const { recent, pushRecent, clearRecent, removeRecent } = useRecentPalettes();
  const historyDebounceRef = useRef(null);
  const skipNextBroadcast = useRef(false);

  // Dynamically inject Google Fonts for the active emotion pair
  const emotionTypePair = useDynamicFonts(activeEmotion);

  // Live page fonts: emotion pair when active, else Typography board
  const headingFontFamily = emotionTypeActive
    ? emotionTypePair.heading.family
    : fontFamily;
  const bodyFontFamily = emotionTypeActive
    ? emotionTypePair.body.family
    : fontFamily;

  /** Debounced history for color picking (image picker / color board) */
  const scheduleHistorySave = useCallback(
    (palette, meta) => {
      if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
      historyDebounceRef.current = setTimeout(() => {
        pushRecent(palette, meta);
      }, 700);
    },
    [pushRecent],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBgChange = useCallback(
    (hex, meta = {}) => {
      setBgColor(hex);
      setAccentHex(null);
      const nextText = textIsAuto ? getContrastColor(hex) : textColor;
      if (textIsAuto) setTextColor(nextText);
      if (meta.source) {
        scheduleHistorySave(
          {
            background: hex,
            text: nextText,
            accent: nextText,
            label: meta.label || "Color pick",
          },
          { source: meta.source, label: meta.label || "Color pick" },
        );
      }
    },
    [textIsAuto, textColor, scheduleHistorySave],
  );

  const handleTextChange = useCallback(
    (hex, meta = {}) => {
      setTextColor(hex);
      setTextIsAuto(false);
      setAccentHex(null);
      if (meta.source) {
        scheduleHistorySave(
          {
            background: bgColor,
            text: hex,
            accent: hex,
            label: meta.label || "Text pick",
          },
          { source: meta.source, label: meta.label || "Text pick" },
        );
      }
    },
    [bgColor, scheduleHistorySave],
  );

  const handleResetTextToAuto = useCallback(() => {
    setTextIsAuto(true);
    setTextColor(getContrastColor(bgColor));
  }, [bgColor]);

  /**
   * Apply palette to live canvas + localStorage history.
   * recordHistory defaults true; pass recordHistory:false for live emotion sync.
   * skipWorkspaceWrite: when applying from external event already written.
   */
  const handleApplyEmotionPalette = useCallback(
    (palette, meta = {}) => {
      if (!palette?.background || !palette?.text) return;
      const emo =
        palette.emotion || palette.emotionId || meta.emotion || null;
      const payload = {
        background: palette.background,
        text: palette.text,
        accent: palette.accent || palette.highlight || palette.text,
        emotion: emo,
        label: palette.label || meta.label || "Applied",
      };

      setBgColor(payload.background);
      setTextColor(payload.text);
      setTextIsAuto(false);
      setAccentHex(payload.accent);
      if (emo) {
        setActiveEmotion(emo);
        setEmotionTypeActive(true);
      }

      // Explicit apply only (gallery, extract, apply buttons) — not live emotion drag-sync
      const shouldHistory = meta.recordHistory === true;
      if (!meta.skipWorkspaceWrite) {
        skipNextBroadcast.current = true;
        applyToWorkspace(payload, {
          source: meta.source || "workspace",
          label: payload.label,
          emotion: emo,
          skipHistory: !shouldHistory,
          // silent so we don't re-enter via event while applying locally
          silent: true,
        });
        // Keep React history state in sync when applyToWorkspace wrote history
        if (shouldHistory) {
          // applyToWorkspace already pushed storage; refresh hook list
          pushRecent(payload, {
            source: meta.source || "workspace",
            label: payload.label,
            emotion: emo,
          });
        }
      } else if (shouldHistory) {
        pushRecent(payload, {
          source: meta.source || "workspace",
          label: payload.label,
          emotion: emo,
        });
      }
    },
    [pushRecent],
  );

  /** Gallery card click → apply + history */
  const handleApplyGalleryPalette = useCallback(
    (palette) => {
      handleApplyEmotionPalette(palette, {
        label: palette.label || "Gallery",
        emotion: palette.emotion,
        source: "gallery",
        recordHistory: true,
      });
    },
    [handleApplyEmotionPalette],
  );

  // Listen for Apply from /extract, /preview, other tabs
  useEffect(() => {
    const applyExternal = (p) => {
      if (!p?.background || !p?.text) return;
      if (skipNextBroadcast.current) {
        skipNextBroadcast.current = false;
        return;
      }
      const sig = paletteSignature({
        background: bgColor,
        text: textColor,
        accent: accentHex || textColor,
        emotion: activeEmotion,
      });
      const nextSig = paletteSignature(p);
      if (sig === nextSig) return;
      setBgColor(p.background);
      setTextColor(p.text);
      setTextIsAuto(false);
      setAccentHex(p.accent || p.highlight || null);
      if (p.emotion) {
        setActiveEmotion(p.emotion);
        setEmotionTypeActive(true);
      }
    };
    const onPalette = (e) => {
      if (e?.detail) applyExternal(e.detail);
    };
    const onStorage = (e) => {
      if (e.key !== ACTIVE_PALETTE_KEY || !e.newValue) return;
      try {
        applyExternal(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("seeui:palette", onPalette);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("seeui:palette", onPalette);
      window.removeEventListener("storage", onStorage);
    };
  }, [bgColor, textColor, accentHex, activeEmotion]);

  const handleToast = useCallback((label) => {
    setToastMsg(label ? `Copied ${label}!` : "Copied!");
  }, []);

  const handleFontChange = useCallback(
    (font) => {
      setFontSlug(font.slug);
      setEmotionTypeActive(false); // manual type overrides emotion pairing on page
      if (!font.weights.includes(fontWeight)) {
        const closest = font.weights.reduce(
          (acc, w) =>
            Math.abs(w - fontWeight) < Math.abs(acc - fontWeight) ? w : acc,
          font.weights[0],
        );
        setFontWeight(closest);
      }
    },
    [fontWeight],
  );

  const handleLogoClick = useCallback(() => logoInputRef.current?.click(), []);
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Cap logo size for localStorage (~1.5MB file → data URL)
    if (file.size > 1.5 * 1024 * 1024) {
      setToastMsg("Logo too large (max 1.5MB)");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") {
        setLogoUrl(dataUrl);
        // Persist immediately so Brand Book always has logo
        writeWorkspaceSnapshot({ logoUrl: dataUrl }, { silent: true });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);
  const handleLogoRemove = useCallback((e) => {
    e.stopPropagation();
    setLogoUrl(null);
    writeWorkspaceSnapshot({ logoUrl: null }, { silent: true });
  }, []);

  /** Wipe every SeeUI localStorage key and reset live workspace */
  const handleClearAllData = useCallback(() => {
    const ok = window.confirm(
      "Delete ALL SeeUI saved data?\n\nThis clears localStorage: palettes, history, custom fonts, logo, and workspace snapshot. This cannot be undone.",
    );
    if (!ok) return;
    clearAllSeeUIStorage();
    setLogoUrl(null);
    setAccentHex(null);
    setActiveEmotion("trust");
    setEmotionTypeActive(true);
    setCustomFonts([]);
    setGalleryActiveId(null);
    clearRecent();
    setToastMsg("All saved data deleted");
    // Soft reload so custom fonts / boards rehydrate cleanly
    window.setTimeout(() => window.location.reload(), 400);
  }, [clearRecent]);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(bgColor)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  }, [bgColor]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const mutedColor = useMemo(() => getMutedContrastColor(bgColor), [bgColor]);
  const isDark = getContrastColor(bgColor) === "#FFFFFF";

  // True WCAG: text color vs background color (not bg vs white)
  const wcagReport = useMemo(
    () => getWcagReport(textColor, bgColor),
    [textColor, bgColor],
  );

  const cardBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.82)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const chipBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)";

  const activePalette = useMemo(
    () => ({
      background: bgColor,
      text: textColor,
      accent: accentHex || textColor,
      highlight: accentHex || textColor,
      emotion: activeEmotion,
      typography: emotionTypePair,
      // Full workspace fields for Brand Book / export consumers
      emotionTypeActive,
      fontWeight,
      fontSize,
      manualFontName: activeFont.name,
      fontSlug,
      isDark,
      textIsAuto,
      mode: isDark ? "dark" : "light",
      logoUrl,
      recent,
      sourceLabel: "SeeUI Workspace",
      brandName: "SeeUI",
    }),
    [
      bgColor,
      textColor,
      accentHex,
      activeEmotion,
      emotionTypePair,
      emotionTypeActive,
      fontWeight,
      fontSize,
      activeFont.name,
      fontSlug,
      isDark,
      textIsAuto,
      logoUrl,
      recent,
    ],
  );

  /** Dedicated snapshot for Brand Book PDF + Export Studio (mirrors last UI state) */
  const brandBookSnapshot = activePalette;

  const recentActiveKey = `${bgColor}|${textColor}|${accentHex || textColor}`;

  // Theme class + accent token (scrollbars are hidden globally)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--seeui-accent", accentHex || textColor || "#6366F1");
    root.classList.toggle("dark", isDark);
  }, [accentHex, textColor, isDark]);

  // Persist workspace to localStorage — DEBOUNCED so rapid color drags
  // don't thrash main thread (PDF only reads storage on download click)
  useEffect(() => {
    writeActivePalette(
      {
        background: bgColor,
        text: textColor,
        accent: accentHex || textColor,
        emotion: activeEmotion,
        label: "Workspace",
      },
      { silent: true },
    );

    const t = window.setTimeout(() => {
      writeWorkspaceSnapshot(
        {
          ...activePalette,
          emotionLabel: emotionTypePair?.label,
          panels: panelOpen,
        },
        { silent: true },
      );
    }, 450);

    return () => clearTimeout(t);
  }, [
    bgColor,
    textColor,
    accentHex,
    activeEmotion,
    activePalette,
    emotionTypePair?.label,
    panelOpen,
  ]);

  // ── Mobile gate overlay ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
          padding: '2rem',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 420,
            padding: '2.5rem 2rem',
            borderRadius: 24,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 1.5rem',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#F8FAFC',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            Open in Desktop Mode
          </h1>

          <p
            style={{
              color: 'rgba(248,250,252,0.6)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            SeeUI is a powerful design tool with draggable panels, color pickers, and typography controls.
            Switch to <strong style={{ color: '#A5B4FC' }}>desktop mode</strong> to unlock the next level of power.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.625rem 1.5rem',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.8125rem',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Use Desktop for Best Experience
            </div>

            <span style={{ color: 'rgba(248,250,252,0.35)', fontSize: '0.75rem' }}>
              Drag panels • Color picker • Font browser
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteLoader
        minMs={750}
        accent={accentHex || (isDark ? "#A5B4FC" : "#6366F1")}
      />

      {/* JSON-LD (home-specific graph is also in root; keep page FAQ-visible content) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLdGraph()),
        }}
      />

      {/* Inject Google Fonts once for every font + weight */}
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both}
        .fade-up-1{animation-delay:0.05s}.fade-up-2{animation-delay:0.12s}
        .fade-up-3{animation-delay:0.20s}.fade-up-4{animation-delay:0.28s}
        @keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}
        .dot-ping{animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite}

        .liquid-btn{position:relative;overflow:hidden;}
        .liquid-btn::before{
          content:"";position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
          transition:left 0.65s ease;pointer-events:none;
        }
        .liquid-btn:hover::before{left:160%;}

        .logo-upload-btn:hover .upload-hint{opacity:1!important}
      `}</style>

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />

      <main
        className="min-h-screen w-full transition-colors duration-[600ms] ease-in-out"
        style={{
          backgroundColor: bgColor,
          fontFamily: bodyFontFamily,
          transition: "background-color 0.6s ease, color 0.5s ease, font-family 0.35s ease",
        }}
      >
        {/* Noise overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        <div
          id="workspace"
          className="relative z-10 mx-auto max-w-5xl px-6 pb-80 pt-8 sm:px-10 sm:pt-12 lg:pl-[380px] scroll-mt-8"
        >
          {/* ── Navbar ─────────────────────────────────────────────────── */}
          <nav className="fade-up flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoClick}
                className="logo-upload-btn relative group flex-shrink-0"
                title={logoUrl ? "Change logo" : "Upload your brand logo"}
              >
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt="Brand logo"
                      className="h-9 w-auto max-w-[120px] rounded-lg object-contain transition-all duration-300"
                      style={{
                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(2px)",
                        WebkitBackdropFilter: "blur(2px)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <button
                      onClick={handleLogoRemove}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{
                        backgroundColor: "#EF4444",
                        border: "1.5px solid rgba(0,0,0,0.3)",
                      }}
                      title="Remove logo"
                    >
                      <svg
                        width="7"
                        height="7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-200 group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: chipBg,
                      border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"}`,
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-500"
                      style={{ backgroundColor: textColor }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={bgColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                    <span
                      className="text-sm tracking-tight transition-colors duration-500"
                      style={{ color: textColor, fontFamily, fontWeight: 700 }}
                    >
                      SeeUI
                    </span>
                    <div
                      className="upload-hint flex items-center gap-1 opacity-0 transition-opacity duration-200 ml-1"
                      style={{ color: mutedColor }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span
                        className="text-[9px] font-medium whitespace-nowrap"
                        style={{ fontFamily }}
                      >
                        Upload logo
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {logoUrl && (
                <span
                  className="text-sm tracking-tight transition-colors duration-500 hidden sm:block"
                  style={{ color: textColor, fontFamily, fontWeight: 700 }}
                >
                  SeeUI
                </span>
              )}

              <button
                onClick={() => setIsDonateOpen(true)}
                className="group ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 ring-1 ring-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              >
                <Heart size={14} className="text-pink-500 group-hover:fill-pink-500 transition-all duration-300" />
                <span className="text-[11px] font-bold text-pink-500">Support</span>
              </button>
            </div>

            <div className="hidden lg:block">
              <PsychologyNav
                textColor={textColor}
                mutedColor={mutedColor}
                chipBg={chipBg}
                cardBorder={cardBorder}
                fontFamily={fontFamily}
                isDark={isDark}
                accent={accentHex || "#818CF8"}
                activeId="workspace"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Psychology palette grid — always visible in navbar actions */}
              <button
                type="button"
                onClick={() => togglePanel("gallery")}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shrink-0"
                style={{
                  background: panelOpen.gallery
                    ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)"
                    : isDark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.28))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.16))",
                  color: panelOpen.gallery ? "#FFFFFF" : isDark ? "#EEF2FF" : "#3730A3",
                  border: panelOpen.gallery
                    ? "1px solid rgba(255,255,255,0.3)"
                    : "1px solid rgba(129,140,248,0.55)",
                  boxShadow: panelOpen.gallery
                    ? "0 8px 24px rgba(99,102,241,0.45)"
                    : "0 4px 14px rgba(99,102,241,0.2)",
                  fontFamily,
                }}
                aria-pressed={!!panelOpen.gallery}
                title={
                  panelOpen.gallery
                    ? "Close psychology palette grid"
                    : "Open psychology palette grid"
                }
              >
                <LayoutGrid size={15} strokeWidth={2.25} />
                <span className="whitespace-nowrap">
                  {panelOpen.gallery ? "Close Psychology Grid" : "Psychology Grid"}
                </span>
              </button>

              {/* Compact font badge */}
              <div
                className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition-colors duration-500"
                style={{
                  backgroundColor: chipBg,
                  color: mutedColor,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                title="Active font"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                <span style={{ color: textColor, fontFamily, fontWeight: 600 }}>
                  {activeFont.name}
                </span>
                <span style={{ opacity: 0.6, fontFamily }}>· {fontWeight}</span>
              </div>

              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-500"
                style={{
                  backgroundColor: chipBg,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full dot-ping rounded-full opacity-75"
                    style={{ backgroundColor: "#22C55E" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "#22C55E" }}
                  />
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: mutedColor, fontFamily, fontWeight: 500 }}
                >
                  Live
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-500"
                style={{
                  backgroundColor: chipBg,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: bgColor,
                    boxShadow: `0 0 0 1.5px ${cardBorder}`,
                  }}
                />
                <span
                  className="text-[11px] font-mono transition-colors duration-500"
                  style={{ color: textColor, fontWeight: 600 }}
                >
                  {bgColor.toUpperCase()}
                </span>
                <span
                  className="w-px h-3"
                  style={{ backgroundColor: cardBorder }}
                />
                <div
                  className="w-3 h-3 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: textColor,
                    boxShadow: `0 0 0 1.5px ${cardBorder}`,
                  }}
                />
                <span
                  className="text-[11px] font-mono transition-colors duration-500"
                  style={{ color: textColor, fontWeight: 600 }}
                >
                  {textColor.toUpperCase()}
                </span>
              </div>

              <a
                href="https://github.com/SomratChandraRoy/seeui"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ml-1"
                style={{
                  backgroundColor: chipBg,
                  color: textColor,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                title="View on GitHub"
              >
                <Github size={16} />
              </a>
            </div>
          </nav>

          {/* ── Hero ───────────────────────────────────────────────────── */}
          <section className="mt-24 sm:mt-32">
            <div className="fade-up fade-up-1 mb-6 flex flex-wrap items-center gap-2.5">
              <WcagBadge
                textColor={textColor}
                backgroundColor={bgColor}
                fontFamily={fontFamily}
                size="md"
              />
              <ExportPaletteMenu
                palette={activePalette}
                onCopied={handleToast}
                fontFamily={fontFamily}
                buttonBg={chipBg}
                buttonColor={textColor}
                borderColor={cardBorder}
                isDark={isDark}
                mutedColor={mutedColor}
                cardBg={
                  isDark
                    ? "linear-gradient(155deg, rgba(28,28,34,0.98), rgba(14,14,20,0.99))"
                    : "linear-gradient(155deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))"
                }
                cardBorder={cardBorder}
                label="Export"
              />
              <BrandBookDownload
                snapshot={brandBookSnapshot}
                fontFamily={fontFamily}
                buttonBg={isDark ? "rgba(99,102,241,0.25)" : "rgba(79,70,229,0.12)"}
                buttonColor={isDark ? "#C7D2FE" : "#4338CA"}
                borderColor={isDark ? "rgba(165,180,252,0.35)" : "rgba(99,102,241,0.3)"}
              />
              <TypographyPairBadge
                pair={emotionTypePair}
                mutedColor={mutedColor}
                textColor={textColor}
                cardBorder={cardBorder}
                fontFamily={fontFamily}
                isDark={isDark}
                accent={accentHex || (isDark ? "#A5B4FC" : "#4F46E5")}
                variant="compact"
              />
            </div>

            <h1
              className="fade-up fade-up-2 leading-[1.05] tracking-tight"
              style={{
                color: textColor,
                fontFamily: headingFontFamily,
                fontSize: `clamp(2.2rem, 6vw, ${fontSize}px)`,
                fontWeight,
                transition: "color 0.5s ease, font-family 0.35s ease",
              }}
            >
              Stop Guessing CSS.
              <br />
              <span
                className="italic"
                style={{
                  opacity: 0.65,
                  fontFamily: headingFontFamily,
                  fontWeight: Math.max(300, fontWeight - 300),
                }}
              >
                Test Backgrounds, Text,
              </span>
              <br />
              and Logos Instantly.
            </h1>

            <p
              className="fade-up fade-up-3 mt-6 max-w-lg leading-relaxed"
              style={{
                color: mutedColor,
                fontFamily: bodyFontFamily,
                fontSize: "1.0625rem",
                fontWeight: 400,
                transition: "color 0.5s ease, font-family 0.35s ease",
              }}
            >
              Check text contrast, extract logo colors, and preview typography live.
              Map brand emotions to psychological palettes, swap 40+ Google Fonts,
              and find the perfect color combination — all in real-time.
            </p>

            <div className="fade-up fade-up-4 mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="liquid-btn rounded-full px-6 py-2.5 text-sm transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: accentHex || textColor,
                  color: bgColor,
                  boxShadow: accentHex
                    ? `0 4px 24px ${accentHex}55`
                    : "0 4px 20px rgba(0,0,0,0.15)",
                  fontFamily: bodyFontFamily,
                  fontWeight: 700,
                }}
              >
                <span className="flex items-center gap-2 relative z-10">
                  {copied ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                  {copied ? "Copied!" : `Copy ${bgColor.toUpperCase()}`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogoClick}
                className="liquid-btn rounded-full px-6 py-2.5 text-sm transition-colors duration-200 active:scale-95"
                style={{
                  backgroundColor: chipBg,
                  color: textColor,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  fontFamily,
                  fontWeight: 600,
                }}
              >
                <span className="flex items-center gap-2 relative z-10">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {logoUrl ? "Change logo" : "Upload logo"}
                </span>
              </button>
            </div>
          </section>

          {/* ── Stats row ──────────────────────────────────────────────── */}
          <section className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Background",
                value: bgColor.toUpperCase(),
                sub: `WCAG ${wcagReport.ratioLabel} · ${wcagReport.label}`,
                mono: true,
              },
              {
                label: "Text",
                value: textColor.toUpperCase(),
                sub: textIsAuto ? "Auto · adapts" : "Manual override",
                mono: true,
              },
              {
                label: "Emotion type",
                value: emotionTypePair.heading.name,
                sub: `+ ${emotionTypePair.body.name} · ${emotionTypePair.label}`,
                mono: false,
              },
            ].map(({ label, value, sub, mono }) => (
              <div
                key={label}
                className="rounded-2xl p-5 sm:p-6 transition-colors duration-500"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <span
                  className="text-[9.5px] uppercase tracking-widest"
                  style={{ color: mutedColor, fontFamily, fontWeight: 700 }}
                >
                  {label}
                </span>
                <div
                  className="mt-2 text-base sm:text-lg tracking-tight truncate transition-colors duration-500"
                  style={{
                    color: textColor,
                    fontWeight: 700,
                    fontFamily: mono
                      ? "ui-monospace, 'JetBrains Mono', monospace"
                      : fontFamily,
                  }}
                >
                  {value}
                </div>
                <div
                  className="mt-1 text-[10px] transition-colors duration-500"
                  style={{ color: mutedColor, fontFamily }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </section>

          {/* ── Demo cards (type + logo) ───────────────────────────────── */}
          <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Card A — Typography showcase */}
            <div
              className="rounded-2xl p-6 transition-colors duration-500"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-[9.5px] uppercase tracking-widest"
                  style={{ color: mutedColor, fontFamily: bodyFontFamily, fontWeight: 700 }}
                >
                  Typography
                </span>
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: bgColor,
                      border: `1.5px solid ${cardBorder}`,
                    }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: textColor,
                      border: `1.5px solid ${cardBorder}`,
                    }}
                  />
                </div>
              </div>
              <div
                className="text-6xl leading-none mb-3 transition-colors duration-500"
                style={{ color: textColor, fontFamily: headingFontFamily, fontWeight }}
              >
                Aa
              </div>
              <div
                className="text-sm mb-1.5 transition-colors duration-500"
                style={{
                  color: textColor,
                  fontFamily: headingFontFamily,
                  fontWeight: Math.min(fontWeight, 600),
                }}
              >
                {emotionTypeActive
                  ? emotionTypePair.heading.name
                  : activeFont.name}
              </div>
              <p
                className="text-xs leading-relaxed transition-colors duration-500"
                style={{ color: mutedColor, fontFamily: bodyFontFamily, fontWeight: 400 }}
              >
                The quick brown fox jumps over the lazy dog — 1234567890.
              </p>
            </div>

            {/* Card B — Logo preview */}
            <div
              className="rounded-2xl p-6 transition-colors duration-500 flex flex-col"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <span
                className="text-[9.5px] uppercase tracking-widest mb-4"
                style={{ color: mutedColor, fontFamily: bodyFontFamily, fontWeight: 700 }}
              >
                {logoUrl ? "Your brand logo" : "Brand preview"}
              </span>
              {logoUrl ? (
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Brand logo preview"
                    className="max-h-20 max-w-full object-contain transition-all duration-500"
                    style={{
                      filter: isDark
                        ? "drop-shadow(0 2px 12px rgba(0,0,0,0.4))"
                        : "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={handleLogoClick}
                  className="liquid-btn flex-1 flex flex-col items-center justify-center rounded-xl gap-2 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.02)",
                    minHeight: 96,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={mutedColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span
                    className="text-[10px]"
                    style={{ color: mutedColor, fontFamily: bodyFontFamily, fontWeight: 600 }}
                  >
                    Upload your logo
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: mutedColor, opacity: 0.6, fontFamily: bodyFontFamily }}
                  >
                    PNG, SVG, JPG
                  </span>
                </button>
              )}
            </div>
          </section>

          {/* ── Image → Emotion extractor ──────────────────────────────── */}
          <div id="extract" className="mt-3 scroll-mt-8">
            <ImageEmotionExtractor
              onApplyPalette={(p) =>
                handleApplyEmotionPalette(p, {
                  label: p.label || "Image emotion",
                  emotion: p.emotion,
                  source: "extract",
                  recordHistory: true,
                })
              }
              cardBg={cardBg}
              cardBorder={cardBorder}
              mutedColor={mutedColor}
              textColor={textColor}
              fontFamily={bodyFontFamily}
              isDark={isDark}
              accent={accentHex || "#818CF8"}
            />
          </div>

          {/* ── Product suite · Studio / Extract / Gradient ────────────── */}
          <StudioJourneyCards
            textColor={textColor}
            mutedColor={mutedColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            headingFontFamily={headingFontFamily}
            bodyFontFamily={bodyFontFamily}
            isDark={isDark}
            accent={accentHex || (isDark ? "#A5B4FC" : "#6366F1")}
            bgColor={bgColor}
          />

          {/* ── Type sampler ───────────────────────────────────────────── */}
          <div
            id="type"
            className="mt-3 rounded-2xl p-6 transition-colors duration-500 scroll-mt-8"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <span
                className="text-[9.5px] uppercase tracking-widest"
                style={{ color: mutedColor, fontFamily: bodyFontFamily, fontWeight: 700 }}
              >
                Type sampler
              </span>
              <span
                className="text-[10px]"
                style={{ color: mutedColor, fontFamily: bodyFontFamily }}
              >
                {emotionTypeActive
                  ? `${emotionTypePair.heading.name} + ${emotionTypePair.body.name}`
                  : `${activeFont.name} · ${fontWeight}`}{" "}
                · {fontSize}px
                {emotionTypeActive ? " · emotion" : ""}
              </span>
            </div>

            <div className="space-y-4">
              <div
                className="leading-[1.05] tracking-tight"
                style={{
                  color: textColor,
                  fontFamily: headingFontFamily,
                  fontSize: `${Math.min(fontSize * 1.2, 80)}px`,
                  fontWeight,
                  transition: "color 0.5s ease, font-family 0.35s ease",
                }}
              >
                Headline 01
              </div>
              <div
                className="leading-tight"
                style={{
                  color: textColor,
                  fontFamily: headingFontFamily,
                  fontSize: `${Math.min(fontSize * 0.55, 36)}px`,
                  fontWeight: Math.min(fontWeight, 600),
                  transition: "color 0.5s ease, font-family 0.35s ease",
                }}
              >
                Subheading that adapts beautifully
              </div>
              <div
                className="leading-relaxed"
                style={{
                  color: mutedColor,
                  fontFamily: bodyFontFamily,
                  fontSize: "16px",
                  fontWeight: 400,
                  transition: "color 0.5s ease, font-family 0.35s ease",
                }}
              >
                Body copy at regular weight. The five boxing wizards jump
                quickly. Pack my box with five dozen liquor jugs.
              </div>
              <div
                className="flex items-center gap-2 flex-wrap pt-4"
                style={{ borderTop: `1px solid ${cardBorder}` }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: mutedColor, fontFamily, fontWeight: 700 }}
                >
                  Weights
                </span>
                {activeFont.weights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setFontWeight(w)}
                    className="liquid-btn text-sm px-3 py-1.5 rounded-lg transition-colors duration-200 active:scale-95"
                    style={{
                      color: w === fontWeight ? bgColor : textColor,
                      backgroundColor:
                        w === fontWeight ? textColor : "transparent",
                      border:
                        w === fontWeight ? "none" : `1px solid ${cardBorder}`,
                      fontFamily,
                      fontWeight: w,
                    }}
                  >
                    Aa {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent history (localStorage) ──────────────────────────── */}
          <div id="recent" className="scroll-mt-8">
            <RecentPalettes
              recent={recent}
              onApply={(p) =>
                handleApplyEmotionPalette(p, {
                  label: p.label || "History",
                  emotion: p.emotion,
                  source: "recent",
                  recordHistory: true,
                })
              }
              title="History · all features"
              onClear={clearRecent}
              onRemove={removeRecent}
              cardBg={cardBg}
              cardBorder={cardBorder}
              mutedColor={mutedColor}
              textColor={textColor}
              fontFamily={fontFamily}
              isDark={isDark}
              activeKey={recentActiveKey}
            />
          </div>

          {/* Gallery is a floating palette (open from dock · LayoutGrid icon) */}
          <div id="gallery" className="scroll-mt-8 mt-3">
            <button
              type="button"
              onClick={() => {
                setPanelOpen((p) => ({ ...p, gallery: true }));
                setPanelFocus("gallery");
              }}
              className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.99]"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-[9.5px] font-bold uppercase tracking-widest"
                style={{ color: mutedColor, fontFamily }}
              >
                Color Palette Gallery
              </div>
              <div
                className="mt-1 text-sm font-extrabold"
                style={{ color: textColor, fontFamily: headingFontFamily }}
              >
                Open psychology palette grid
              </div>
              <p
                className="mt-1.5 text-[12px] leading-relaxed max-w-lg"
                style={{ color: mutedColor, fontFamily: bodyFontFamily }}
              >
                Floating glass panel — same style as Color Picker. Browse emotion
                sets, filter dark/light, click to apply live.
              </p>
              <span
                className="inline-flex mt-3 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  backgroundColor: accentHex || textColor,
                  color: bgColor,
                  fontFamily,
                }}
              >
                Open gallery panel →
              </span>
            </button>
          </div>

          {/* ── Full Design System Scale (Tailwind 50–950) ─────────────── */}
          <div className="mt-3">
            <ColorScaleGrid
              baseHex={accentHex || textColor}
              colorName={activeEmotion || "brand"}
              emotionLabel={emotionTypePair?.label || activeEmotion || "Brand"}
              cardBg={cardBg}
              cardBorder={cardBorder}
              mutedColor={mutedColor}
              textColor={textColor}
              fontFamily={bodyFontFamily}
              isDark={isDark}
              accent={accentHex || (isDark ? "#A5B4FC" : "#4F46E5")}
              onCopied={handleToast}
            />
          </div>

          {/* Mobile psychology nav */}
          <section
            className="mt-3 rounded-2xl p-5 lg:hidden"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <span
              className="text-[9.5px] font-bold uppercase tracking-widest"
              style={{ color: mutedColor, fontFamily: bodyFontFamily }}
            >
              Design journey
            </span>
            <div className="mt-3">
              <PsychologyNav
                variant="full"
                textColor={textColor}
                mutedColor={mutedColor}
                chipBg={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}
                cardBorder={cardBorder}
                fontFamily={fontFamily}
                isDark={isDark}
                accent={accentHex || "#818CF8"}
              />
            </div>
          </section>
        </div>

        <CopyToast
          message={toastMsg || "Copied!"}
          visible={!!toastMsg}
          onHide={() => setToastMsg(null)}
        />

        <CustomCursor
          accent={accentHex || textColor || "#818CF8"}
          textColor={textColor}
          background={bgColor}
          emotion={activeEmotion}
          enabled={!isMobile}
        />

        {/* Floating boards — open/close via Limelight PanelDock */}
        <TypographyBoard
          fontSlug={fontSlug}
          fontWeight={fontWeight}
          fontSize={fontSize}
          fontWeightsAvailable={activeFont.weights || [400, 500, 600, 700]}
          onFontChange={handleFontChange}
          onWeightChange={setFontWeight}
          onSizeChange={setFontSize}
          customFonts={customFonts}
          onCustomFontsChange={setCustomFonts}
          minimized={!panelOpen.type}
          onMinimizedChange={(m) => setPanelMinimized("type", m)}
          showLauncher={false}
        />

        <ColorBoard
          bgHex={bgColor}
          textHex={textColor}
          onBgChange={(hex) =>
            handleBgChange(hex, { source: "manual", label: "Color board" })
          }
          onTextChange={(hex) =>
            handleTextChange(hex, { source: "manual", label: "Color board" })
          }
          onResetText={handleResetTextToAuto}
          textIsAuto={textIsAuto}
          minimized={!panelOpen.color}
          onMinimizedChange={(m) => setPanelMinimized("color", m)}
          showLauncher={false}
        />

        <ImageColorPicker
          bgHex={bgColor}
          textHex={textColor}
          onBgChange={(hex) =>
            handleBgChange(hex, {
              source: "image-picker",
              label: "Image picker",
            })
          }
          onTextChange={(hex) =>
            handleTextChange(hex, {
              source: "image-picker",
              label: "Image picker",
            })
          }
          minimized={!panelOpen.image}
          onMinimizedChange={(m) => setPanelMinimized("image", m)}
          showLauncher={false}
        />

        <EmotionColorBoard
          onApplyPalette={(palette, meta = {}) =>
            handleApplyEmotionPalette(palette, {
              ...meta,
              source: meta.source || "emotion",
              label: meta.label || palette.label || "Emotion board",
              // Explicit Apply button sets recordHistory; live sync does not
              recordHistory: meta.recordHistory === true,
            })
          }
          minimized={!panelOpen.emotion}
          onMinimizedChange={(m) => setPanelMinimized("emotion", m)}
          showLauncher={false}
        />

        <ColorPaletteGallery
          onApply={handleApplyGalleryPalette}
          activeId={galleryActiveId}
          onActiveId={setGalleryActiveId}
          minimized={!panelOpen.gallery}
          onMinimizedChange={(m) => setPanelMinimized("gallery", m)}
          showLauncher={false}
        />

        <PanelDock
          open={panelOpen}
          onToggle={togglePanel}
          focusId={panelFocus}
          onFocus={setPanelFocus}
          isDark={isDark}
          background={bgColor}
          textColor={textColor}
          mutedColor={mutedColor}
          accent={accentHex || textColor}
        />

        <DonateModal
          isOpen={isDonateOpen} 
          onClose={() => setIsDonateOpen(false)} 
        />

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer
          className="relative z-10 mx-auto max-w-5xl px-6 pb-8 sm:px-10 lg:pl-[380px]"
          style={{ marginTop: -200 }}
        >
          <div
            className="rounded-2xl p-6 transition-colors duration-500"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div
                  className="text-sm font-semibold mb-1 transition-colors duration-500"
                  style={{ color: textColor, fontFamily }}
                >
                  SeeUI
                </div>
                <p
                  className="text-xs transition-colors duration-500"
                  style={{ color: mutedColor, fontFamily }}
                >
                  Live UI Color Tester & Typography Playground. Free forever.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-[10px] transition-colors duration-500"
                  style={{ color: mutedColor, fontFamily }}
                >
                  © {new Date().getFullYear()} SeeUI
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
