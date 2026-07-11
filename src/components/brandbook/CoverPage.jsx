/**
 * Page 1 — Cover + Executive Summary (live workspace snapshot)
 */

import { Page, View, Text, Image } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { pageLabel } from "./brandBookHelpers";
import { MiniSwatch, Kpi } from "./shared";

export default function CoverPage({ model }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const bodyFamily = model.pdfFonts?.body || "Helvetica";
  const primary = model.accent;
  const ws = model.workspaceSummary;
  const logo = model.logoUrl;
  const canShowLogo =
    typeof logo === "string" &&
    (logo.startsWith("data:image") ||
      logo.startsWith("http://") ||
      logo.startsWith("https://") ||
      logo.startsWith("/"));

  return (
    <Page size="A4" style={s.coverPage}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <Text style={s.coverEyebrow}>
            {model.brandName} · {model.sourceLabel} · Confidential export
          </Text>
          {canShowLogo ? (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                backgroundColor: "#F8FAFC",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={logo}
                style={{ width: 52, height: 52, objectFit: "contain" }}
              />
            </View>
          ) : null}
        </View>

        <Text style={[s.coverTitle, { fontFamily: headingFamily }]}>
          {model.documentTitle}
        </Text>

        <Text style={[s.coverSubtitle, { fontFamily: bodyFamily }]}>
          Primary Emotion: {model.emotion.label}
          {"  ·  "}
          {model.emotion.familyPsychology}
          {"  ·  "}
          {model.mode === "dark" ? "Dark mode" : "Light mode"} interface
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View style={[s.coverBadge, { backgroundColor: primary, marginRight: 8 }]}>
            <Text style={s.coverBadgeText}>
              Live workspace snapshot
            </Text>
          </View>
          <View
            style={[
              s.coverBadge,
              {
                backgroundColor: "#0F172A",
                marginBottom: 18,
              },
            ]}
          >
            <Text style={s.coverBadgeText}>
              v{model.documentVersion} · A4 · {model.totalPages} pages
            </Text>
          </View>
        </View>

        {/* Document control */}
        <View style={[s.cardMuted, { marginBottom: 14 }]}>
          <Text style={s.sectionLabel}>Document control</Text>
          <View style={s.kpiGrid}>
            <Kpi label="Generated" value={model.generatedAt} sub={model.generatedDisplay} />
            <Kpi label="Status" value="Export" sub={model.documentStatus} />
            <Kpi label="Emotion ID" value={model.emotion.id} sub={model.emotion.familyName + " family"} />
            <Kpi label="WCAG text/bg" value={ws.contrast} sub={ws.wcagLevel} />
          </View>
        </View>

        {/* Executive KPIs from live UI */}
        <Text style={s.coverRationaleLabel}>Workspace summary (last configuration)</Text>
        <View style={[s.card, { marginBottom: 12 }]}>
          <View style={s.kpiGrid}>
            <Kpi label="Primary emotion" value={ws.primaryEmotion} sub="Psychology driver" />
            <Kpi label="Color mode" value={ws.colorMode} sub={model.textIsAuto ? "Auto text contrast" : "Manual text color"} />
            <Kpi label="Type mode" value={ws.typeMode} sub={`${ws.heading} / ${ws.body}`} />
            <Kpi label="Hero type" value={`${ws.heroWeight} / ${ws.heroSize}`} sub="Weight · size from typography board" />
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 4,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            {[
              { label: "Background", hex: model.background },
              { label: "Text", hex: model.text },
              { label: "Accent", hex: model.accent },
              { label: "Muted", hex: model.colors.muted.hex },
            ].map((chip) => (
              <View
                key={chip.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <MiniSwatch hex={chip.hex} size={14} />
                <View>
                  <Text style={{ fontSize: 7, color: "#94A3B8", fontFamily: "Helvetica" }}>
                    {chip.label}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#334155", fontFamily: "Helvetica" }}>
                    {chip.hex}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.coverRationaleLabel}>Design rationale</Text>
        <Text style={[s.coverRationale, { fontFamily: bodyFamily }]}>
          {model.rationale}
        </Text>

        <Text
          style={{
            marginTop: 14,
            fontSize: 8,
            color: "#94A3B8",
            fontFamily: "Helvetica",
            lineHeight: 1.45,
          }}
        >
          Contents: 01 Cover · 02 Emotion strategy · 03 Color system · 04 Accessibility ·
          05 Typography · 06 UI application, tokens & session history
        </Text>
      </View>

      <View style={[s.coverFooterBar, { backgroundColor: primary }]}>
        <View>
          <Text style={s.coverFooterMeta}>
            {model.productTagline}
          </Text>
          <Text style={[s.coverFooterMeta, { marginTop: 4 }]}>
            Captures the colors, type, WCAG scores, and decisions from your last SeeUI session
          </Text>
        </View>
        <Text style={s.coverFooterMeta}>{pageLabel(1, model.totalPages)}</Text>
      </View>
    </Page>
  );
}
