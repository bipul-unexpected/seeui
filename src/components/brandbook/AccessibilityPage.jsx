/**
 * Page 4 — Accessibility & WCAG Compliance
 */

import { Page, View, Text } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { PageChrome, PageFooter, WcagBadge, MiniSwatch } from "./shared";

export default function AccessibilityPage({ model }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const bodyFamily = model.pdfFonts?.body || "Helvetica";
  const w = model.wcag;

  const rows = [
    {
      pair: "Text on Background",
      detail: "Primary body & UI text",
      fg: model.colors.text.hex,
      bg: model.colors.background.hex,
      report: w.textOnBg,
      critical: true,
    },
    {
      pair: "Accent on Background",
      detail: "Links & icons on canvas",
      fg: model.colors.accent.hex,
      bg: model.colors.background.hex,
      report: w.accentOnBg,
      critical: true,
    },
    {
      pair: "White on Accent",
      detail: "Primary button label",
      fg: "#FFFFFF",
      bg: model.colors.accent.hex,
      report: w.whiteOnAccent,
      critical: true,
    },
    {
      pair: "Text on Accent",
      detail: "Brand text over accent fills",
      fg: model.colors.text.hex,
      bg: model.colors.accent.hex,
      report: w.textOnAccent,
      critical: false,
    },
    {
      pair: "Black on Accent",
      detail: "Alternate CTA ink",
      fg: "#000000",
      bg: model.colors.accent.hex,
      report: w.blackOnAccent,
      critical: false,
    },
    {
      pair: "Muted on Background",
      detail: "Captions & secondary labels",
      fg: model.colors.muted.hex,
      bg: model.colors.background.hex,
      report: w.mutedOnBg,
      critical: false,
    },
    {
      pair: "White on Background",
      detail: "Inverse text check",
      fg: "#FFFFFF",
      bg: model.colors.background.hex,
      report: w.whiteOnBg,
      critical: false,
    },
    {
      pair: "Black on Background",
      detail: "Inverse text check",
      fg: "#000000",
      bg: model.colors.background.hex,
      report: w.blackOnBg,
      critical: false,
    },
  ];

  const primary = w.textOnBg;
  const cta = w.whiteOnAccent.pass || w.blackOnAccent.pass;

  return (
    <Page size="A4" style={s.page}>
      <PageChrome model={model} title="Accessibility" page={4} rightMeta="04 · WCAG 2.1" />

      {/* Score summary */}
      <View style={[s.row, { marginBottom: 12 }]}>
        <View
          style={[
            s.card,
            {
              flex: 1,
              marginRight: 8,
              marginBottom: 0,
              borderLeftWidth: 3,
              borderLeftColor: primary.pass ? "#22C55E" : "#EF4444",
            },
          ]}
        >
          <Text style={s.kpiLabel}>Primary text contrast</Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: headingFamily,
              color: "#0F172A",
            }}
          >
            {primary.ratioLabel}
          </Text>
          <View style={{ marginTop: 6 }}>
            <WcagBadge report={primary} />
          </View>
          <Text style={[s.kpiSub, { marginTop: 6 }]}>
            Level {primary.level} · normal text target ≥ 4.5:1 (AA) / 7:1 (AAA)
          </Text>
        </View>

        <View style={[s.cardMuted, { flex: 1, marginBottom: 0 }]}>
          <Text style={s.kpiLabel}>Luminance snapshot</Text>
          <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 4 }]}>
            Background {(model.luminance.background * 100).toFixed(1)}% · Text{" "}
            {(model.luminance.text * 100).toFixed(1)}% · Accent{" "}
            {(model.luminance.accent * 100).toFixed(1)}%
          </Text>
          <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 6 }]}>
            Interface mode: <Text style={{ fontWeight: 700 }}>{model.mode}</Text>
            {" · "}
            CTA label:{" "}
            <Text style={{ fontWeight: 700 }}>
              {cta
                ? w.whiteOnAccent.pass
                  ? "Use white on accent"
                  : "Prefer black on accent"
                : "Recheck CTA contrast"}
            </Text>
          </Text>
          <Text style={[s.kpiSub, { marginTop: 8 }]}>
            Live SeeUI WCAG badge reflects text-on-background only; this page expands all critical pairs.
          </Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>Contrast matrix</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableCellBold, { width: "28%" }]}>Pairing</Text>
          <Text style={[s.tableCellBold, { width: "14%" }]}>Ratio</Text>
          <Text style={[s.tableCellBold, { width: "14%" }]}>Level</Text>
          <Text style={[s.tableCellBold, { width: "18%" }]}>Result</Text>
          <Text style={[s.tableCellBold, { width: "26%" }]}>Priority</Text>
        </View>
        {rows.map((row) => (
          <View key={row.pair} style={s.tableRow} wrap={false}>
            <View style={{ width: "28%", flexDirection: "row", alignItems: "center" }}>
              <MiniSwatch hex={row.fg} />
              <MiniSwatch hex={row.bg} />
              <View style={{ flex: 1 }}>
                <Text style={s.tableCellBold}>{row.pair}</Text>
                <Text style={{ fontSize: 7, color: "#94A3B8", fontFamily: "Helvetica" }}>
                  {row.detail}
                </Text>
              </View>
            </View>
            <Text style={[s.tableCellBold, { width: "14%" }]}>
              {row.report.ratioLabel}
            </Text>
            <Text style={[s.tableCell, { width: "14%" }]}>{row.report.level}</Text>
            <View style={{ width: "18%" }}>
              <WcagBadge report={row.report} />
            </View>
            <Text style={[s.tableCell, { width: "26%" }]}>
              {row.critical ? "Critical — ship blocker if fail" : "Supporting check"}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[s.sectionLabel, { marginTop: 12 }]}>Implementation checklist</Text>
      <View style={s.card}>
        {[
          "Body text and form labels always use Text on Background at AA or better.",
          "Primary buttons: white (or black) label on Accent only when that pair passes AA.",
          "Do not rely on color alone for state — pair with icons, weight, or copy.",
          "Focus rings should use accent at ≥ 3:1 against adjacent colors (non-text UI).",
          "Muted captions must still meet 4.5:1 when they carry essential information.",
          "Retest contrast after any live palette change before exporting again.",
        ].map((item, i) => (
          <Text
            key={item}
            style={{
              fontSize: 8.5,
              fontFamily: bodyFamily,
              color: "#334155",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            {i + 1}.  {item}
          </Text>
        ))}
      </View>

      <PageFooter model={model} page={4} />
    </Page>
  );
}
