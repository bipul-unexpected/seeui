/**
 * Page 5 — Typography Hierarchy, sources & workspace type settings
 */

import { Page, View, Text } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { PageChrome, PageFooter } from "./shared";

export default function TypographyPage({ model }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const bodyFamily = model.pdfFonts?.body || "Helvetica";
  const scale = model.typeScale || [];

  return (
    <Page size="A4" style={s.page}>
      <PageChrome model={model} title="Typography Hierarchy" page={5} rightMeta="05 · Type system" />

      {/* Identity + workspace type mode */}
      <View style={[s.row, { marginBottom: 12 }]}>
        <View style={[s.card, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
          <Text style={s.typeRole}>Heading font</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: headingFamily,
              marginTop: 4,
              marginBottom: 2,
            }}
          >
            {model.headingFontName}
          </Text>
          <Text style={s.kpiSub}>
            Emotion pair · {model.typography?.heading?.category || "serif/sans"} · PDF registered
          </Text>
          {model.typography?.heading?.googleUrl ? (
            <Text style={[s.kpiSub, { marginTop: 4 }]}>
              Specimen: {model.typography.heading.googleUrl.replace("https://", "")}
            </Text>
          ) : null}
        </View>
        <View style={[s.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={s.typeRole}>Body font</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: bodyFamily,
              marginTop: 4,
              marginBottom: 2,
            }}
          >
            {model.bodyFontName}
          </Text>
          <Text style={s.kpiSub}>
            Emotion pair · {model.typography?.body?.category || "sans"} · PDF registered
          </Text>
          {model.typography?.body?.googleUrl ? (
            <Text style={[s.kpiSub, { marginTop: 4 }]}>
              Specimen: {model.typography.body.googleUrl.replace("https://", "")}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[s.cardMuted, { marginBottom: 12 }]}>
        <Text style={s.typeRole}>Live workspace type settings</Text>
        <View style={[s.kpiGrid, { marginTop: 6 }]}>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Type mode</Text>
            <Text style={s.kpiValue}>
              {model.emotionTypeActive ? "Emotion pair" : "Manual board"}
            </Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Active heading</Text>
            <Text style={s.kpiValue}>{model.activeHeadingName}</Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Hero weight</Text>
            <Text style={s.kpiValue}>{model.manualFont.weight}</Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Hero size</Text>
            <Text style={s.kpiValue}>{model.manualFont.size}px</Text>
          </View>
        </View>
        {!model.emotionTypeActive && model.manualFont.name ? (
          <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 4 }]}>
            Manual override active: {model.manualFont.name}
            {model.manualFont.slug ? ` (${model.manualFont.slug})` : ""}. Emotion pair remains the
            recommended system default for brand consistency.
          </Text>
        ) : (
          <Text style={[s.bodyText, { fontFamily: bodyFamily, marginTop: 4 }]}>
            Emotion typography is active — headings and body follow the {model.emotion.label} pair
            ({model.typography?.label || model.emotion.label}).
          </Text>
        )}
      </View>

      <Text style={s.sectionLabel}>Visual scale (print samples)</Text>

      {scale.map((item) => {
        const family = item.font === "heading" ? headingFamily : bodyFamily;
        const size = item.pt;
        return (
          <View key={item.role} style={s.typeBlock} wrap={false}>
            <View style={s.typeMeta}>
              <Text style={s.typeRole}>{item.role}</Text>
              <Text style={s.typeName}>
                {item.font === "heading" ? model.activeHeadingName : model.activeBodyName}
                {" · "}
                {size}pt · weight {item.weight}
                {" · ~"}
                {item.px}px web
              </Text>
            </View>
            <Text
              style={{
                fontSize: size,
                fontWeight: item.weight >= 700 ? 700 : 400,
                fontFamily: family,
                color: model.text,
                lineHeight: item.font === "heading" ? 1.2 : 1.5,
                marginBottom: 3,
              }}
            >
              {item.sample}
            </Text>
            <Text style={s.typeCaption}>{item.usage}</Text>
          </View>
        );
      })}

      {model.typography?.psychology ? (
        <View
          style={{
            padding: 10,
            backgroundColor: "#F8FAFC",
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: model.accent,
          }}
        >
          <Text style={s.typeRole}>Type psychology</Text>
          <Text
            style={{
              fontSize: 9,
              fontFamily: bodyFamily,
              color: "#475569",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {model.typography.psychology}
          </Text>
        </View>
      ) : null}

      <PageFooter model={model} page={5} />
    </Page>
  );
}
