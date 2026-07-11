/**
 * Page 2 — Emotion Strategy & Brand Psychology
 */

import { Page, View, Text } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { PageChrome, PageFooter, MiniSwatch } from "./shared";

export default function StrategyPage({ model }) {
  const bodyFamily = model.pdfFonts?.body || "Helvetica";
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const e = model.emotion;

  return (
    <Page size="A4" style={s.page}>
      <PageChrome model={model} title="Emotion Strategy" page={2} />

      <Text style={s.sectionLabel}>Primary emotion profile</Text>
      <View style={[s.card, { marginBottom: 12 }]}>
        <View style={s.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: headingFamily,
                color: "#0F172A",
                marginBottom: 4,
              }}
            >
              {e.label}
            </Text>
            <Text style={{ fontSize: 9, color: "#64748B", fontFamily: "Helvetica" }}>
              ID: {e.id}  ·  Weight: {e.weight}  ·  Color family: {e.familyName}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: model.accent,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 8, color: "#fff", fontFamily: "Helvetica" }}>
              Family signal
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                marginTop: 2,
                fontFamily: headingFamily,
              }}
            >
              {e.familyName}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
          }}
        >
          <Text style={s.typeRole}>Color psychology (family)</Text>
          <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 4 }]}>
            {e.familyName} communicates {e.familyPsychology.toLowerCase()}. In product UI this
            family supports the emotional goal of <Text style={{ fontWeight: 700 }}>{e.label}</Text>{" "}
            across marketing, product chrome, and print collateral.
          </Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>How this maps to your live palette</Text>
      <View style={[s.row, { marginBottom: 12 }]}>
        {[
          {
            title: "Background",
            hex: model.background,
            note: "Sets arousal baseline and mode (dark/light).",
          },
          {
            title: "Text",
            hex: model.text,
            note: model.textIsAuto
              ? "Auto-contrasted against background for legibility."
              : "Manually locked from the color board.",
          },
          {
            title: "Accent",
            hex: model.accent,
            note: "Primary interactive emphasis and brand spark.",
          },
        ].map((item, idx) => (
          <View
            key={item.title}
            style={[
              s.card,
              {
                flex: 1,
                marginRight: idx < 2 ? 8 : 0,
                marginBottom: 0,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <MiniSwatch hex={item.hex} size={16} />
              <Text style={{ fontSize: 10, fontWeight: 700, fontFamily: headingFamily }}>
                {item.title}
              </Text>
            </View>
            <Text style={{ fontSize: 8, color: "#64748B", fontFamily: "Helvetica", marginBottom: 4 }}>
              {item.hex}
            </Text>
            <Text style={{ fontSize: 8, color: "#475569", fontFamily: bodyFamily, lineHeight: 1.4 }}>
              {item.note}
            </Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionLabel}>Typography psychology</Text>
      <View style={[s.cardMuted, { marginBottom: 12 }]}>
        <Text style={[s.bodyText, { fontFamily: bodyFamily }]}>
          {model.typography?.psychology ||
            "Heading and body faces are paired to reinforce the emotional signal while remaining readable at UI scale."}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.kpiLabel}>Heading face</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, fontFamily: headingFamily }}>
              {model.headingFontName}
            </Text>
            <Text style={s.kpiSub}>
              {model.typography?.heading?.category || "display"} · hierarchy & authority
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.kpiLabel}>Body face</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, fontFamily: bodyFamily }}>
              {model.bodyFontName}
            </Text>
            <Text style={s.kpiSub}>
              {model.typography?.body?.category || "sans"} · reading & UI chrome
            </Text>
          </View>
        </View>
        <Text style={[s.kpiSub, { marginTop: 8 }]}>
          Active type mode: {model.workspaceSummary.typeMode}
          {!model.emotionTypeActive && model.manualFont?.name
            ? ` · Manual board font: ${model.manualFont.name} (${model.manualFont.weight})`
            : ""}
        </Text>
      </View>

      <Text style={s.sectionLabel}>Colors & treatments to avoid</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableCellBold, { width: "12%" }]}>#</Text>
          <Text style={[s.tableCellBold, { width: "88%" }]}>
            Guidance for {e.label} systems
          </Text>
        </View>
        {(e.avoid?.length ? e.avoid : ["No specific avoid list — keep contrast high and accent intentional."]).map(
          (line, i) => (
            <View key={i} style={s.tableRow} wrap={false}>
              <Text style={[s.tableCellBold, { width: "12%", color: model.accent }]}>
                0{i + 1}
              </Text>
              <Text style={[s.tableCell, { width: "88%", fontFamily: bodyFamily }]}>
                {line}
              </Text>
            </View>
          ),
        )}
      </View>

      <View style={[s.cardMuted, { marginTop: 12 }]}>
        <Text style={s.typeRole}>Strategic principle</Text>
        <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 4 }]}>
          {model.rationale}
        </Text>
      </View>

      <PageFooter model={model} page={2} />
    </Page>
  );
}
