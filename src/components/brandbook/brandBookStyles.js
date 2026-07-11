/**
 * Corporate Brand Book styles — dense, print-ready, minimalist system.
 */

import { StyleSheet } from "@react-pdf/renderer";

export const brandBookStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: "#0F172A",
  },

  // ── Cover ────────────────────────────────────────────────────────────────
  coverPage: {
    paddingTop: 48,
    paddingBottom: 0,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverEyebrow: {
    fontSize: 8,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#64748B",
    marginBottom: 12,
    fontFamily: "Helvetica",
  },
  coverTitle: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.12,
    color: "#0F172A",
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "#334155",
    marginBottom: 16,
    lineHeight: 1.5,
  },
  coverBadge: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
    marginBottom: 18,
  },
  coverBadgeText: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  coverRationaleLabel: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#94A3B8",
    marginBottom: 6,
    fontFamily: "Helvetica",
  },
  coverRationale: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: 460,
  },
  coverFooterBar: {
    height: 88,
    marginHorizontal: -40,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  coverFooterMeta: {
    fontSize: 8,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Helvetica",
  },

  // ── Shared chrome ────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pageHeaderTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
  },
  pageHeaderMeta: {
    fontSize: 8,
    color: "#94A3B8",
    fontFamily: "Helvetica",
  },
  sectionLabel: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 6,
    fontFamily: "Helvetica",
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#475569",
  },
  pageFooter: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
  pageFooterText: {
    fontSize: 7.5,
    color: "#94A3B8",
    fontFamily: "Helvetica",
  },

  // ── Cards / grids ────────────────────────────────────────────────────────
  card: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardMuted: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  col: {
    flexDirection: "column",
  },

  // KPI / summary chips
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 4,
  },
  kpiItem: {
    width: "25%",
    paddingRight: 8,
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#94A3B8",
    marginBottom: 3,
    fontFamily: "Helvetica",
  },
  kpiValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0F172A",
  },
  kpiSub: {
    fontSize: 7.5,
    color: "#64748B",
    marginTop: 2,
    fontFamily: "Helvetica",
  },

  // ── Color system ─────────────────────────────────────────────────────────
  swatchRow: {
    flexDirection: "row",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  swatchBlock: {
    width: 92,
    height: 92,
  },
  swatchMeta: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  swatchName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 3,
    color: "#0F172A",
  },
  codeLine: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 2,
    fontFamily: "Helvetica",
  },
  codeLabel: {
    color: "#94A3B8",
  },

  // Tables
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableCell: {
    fontSize: 8,
    color: "#334155",
    fontFamily: "Helvetica",
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 700,
    color: "#0F172A",
  },
  badgePass: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#DCFCE7",
  },
  badgePassText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#166534",
    fontFamily: "Helvetica",
  },
  badgeFail: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#FEE2E2",
  },
  badgeFailText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#991B1B",
    fontFamily: "Helvetica",
  },
  badgeWarn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#FEF3C7",
  },
  badgeWarnText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#92400E",
    fontFamily: "Helvetica",
  },

  // ── Typography ───────────────────────────────────────────────────────────
  typeBlock: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  typeMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  typeRole: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#94A3B8",
    fontFamily: "Helvetica",
  },
  typeName: {
    fontSize: 8,
    color: "#64748B",
    fontFamily: "Helvetica",
  },
  typeH1: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#0F172A",
    marginBottom: 4,
  },
  typeH2: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.25,
    color: "#0F172A",
    marginBottom: 4,
  },
  typeBody: {
    fontSize: 10,
    lineHeight: 1.55,
    color: "#334155",
  },
  typeCaption: {
    fontSize: 7.5,
    color: "#94A3B8",
    marginTop: 3,
    fontFamily: "Helvetica",
  },

  // ── UI mock ──────────────────────────────────────────────────────────────
  mockBrowser: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },
  mockChrome: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  mockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  mockUrl: {
    marginLeft: 8,
    fontSize: 7.5,
    color: "#94A3B8",
    fontFamily: "Helvetica",
  },
  mockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mockLogo: {
    fontSize: 10,
    fontWeight: 700,
  },
  mockNavItem: {
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  mockHero: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  mockHeroTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
    lineHeight: 1.2,
  },
  mockHeroSub: {
    fontSize: 9,
    marginBottom: 12,
    lineHeight: 1.45,
    maxWidth: 320,
  },
  mockCta: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  mockCtaText: {
    fontSize: 8.5,
    fontWeight: 700,
  },
  mockCardRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mockCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  mockCardTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  mockCardBody: {
    fontSize: 7.5,
    lineHeight: 1.4,
  },

  // Code / token block
  codeBlock: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  codeBlockText: {
    fontSize: 7,
    color: "#E2E8F0",
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },

  // Bullet
  bullet: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 4,
    lineHeight: 1.4,
    paddingLeft: 2,
  },
});
