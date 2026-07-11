/**
 * Page 6 — UI Application, design tokens, export snippets, session history
 */

import { Page, View, Text, Image } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { PageChrome, PageFooter, MiniSwatch } from "./shared";

export default function UIApplicationPage({ model }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const bodyFamily = model.pdfFonts?.body || "Helvetica";
  const { background, text, accent } = model;
  const ctaText = model.wcag.whiteOnAccent.pass ? "#FFFFFF" : "#000000";
  const specs = model.designSpecs;
  const history = model.history || [];
  const logo = model.logoUrl;
  const canShowLogo =
    typeof logo === "string" &&
    (logo.startsWith("data:image") ||
      logo.startsWith("http://") ||
      logo.startsWith("https://") ||
      logo.startsWith("/"));

  // Short token lines for print (not full multi-line dump)
  const tokenLines = [
    `--color-bg: ${background};`,
    `--color-text: ${text};`,
    `--color-primary: ${accent};`,
    `--font-heading: "${model.headingFontName}";`,
    `--font-body: "${model.bodyFontName}";`,
    `/* hex: ${model.tokens.hexArray} */`,
  ];

  return (
    <Page size="A4" style={s.page}>
      <PageChrome
        model={model}
        title="UI Application & Specs"
        page={6}
        rightMeta="06 · Tokens · History"
      />

      <Text style={s.sectionLabel}>Website header + hero (applied system)</Text>

      <View style={s.mockBrowser} wrap={false}>
        <View style={s.mockChrome}>
          <View style={[s.mockDot, { backgroundColor: "#F87171" }]} />
          <View style={[s.mockDot, { backgroundColor: "#FBBF24" }]} />
          <View style={[s.mockDot, { backgroundColor: "#34D399" }]} />
          <Text style={s.mockUrl}>https://yourbrand.com · {model.emotion.label} theme</Text>
        </View>

        <View style={[s.mockHeader, { backgroundColor: background }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {canShowLogo ? (
              <Image
                src={logo}
                style={{
                  width: 22,
                  height: 22,
                  marginRight: 8,
                  objectFit: "contain",
                }}
              />
            ) : null}
            <Text style={[s.mockLogo, { fontFamily: headingFamily, color: text }]}>
              {model.brandName}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {["Product", "Pricing", "Docs"].map((item) => (
              <Text
                key={item}
                style={[
                  s.mockNavItem,
                  {
                    fontFamily: bodyFamily,
                    color: text,
                    marginLeft: 12,
                    opacity: 0.75,
                  },
                ]}
              >
                {item}
              </Text>
            ))}
            <View
              style={[
                s.mockCta,
                {
                  backgroundColor: accent,
                  marginLeft: 12,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                },
              ]}
            >
              <Text style={[s.mockCtaText, { fontFamily: bodyFamily, color: ctaText }]}>
                Get Started
              </Text>
            </View>
          </View>
        </View>

        <View style={[s.mockHero, { backgroundColor: background }]}>
          <Text style={[s.mockHeroTitle, { fontFamily: headingFamily, color: text }]}>
            Design with {model.emotion.label.toLowerCase()}.
          </Text>
          <Text
            style={[
              s.mockHeroSub,
              { fontFamily: bodyFamily, color: text, opacity: 0.8 },
            ]}
          >
            Live palette + type from your SeeUI session — header, hero, and primary CTA using
            {` ${model.activeHeadingName} / ${model.activeBodyName}`}.
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[s.mockCta, { backgroundColor: accent }]}>
              <Text style={[s.mockCtaText, { fontFamily: bodyFamily, color: ctaText }]}>
                Call to Action
              </Text>
            </View>
            <Text
              style={{
                marginLeft: 12,
                fontSize: 8,
                fontFamily: bodyFamily,
                color: accent,
              }}
            >
              Secondary link →
            </Text>
          </View>
        </View>

        <View style={[s.mockCardRow, { backgroundColor: background }]}>
          {[
            {
              title: "Color",
              body: `Accent ${accent} · BG ${background}`,
            },
            {
              title: "Type",
              body: `${model.activeHeadingName} + ${model.activeBodyName}`,
            },
            {
              title: "Access",
              body: `${model.wcag.textOnBg.ratioLabel} · ${model.wcag.textOnBg.level}`,
            },
          ].map((card, i) => (
            <View
              key={card.title}
              style={[
                s.mockCard,
                {
                  backgroundColor: background,
                  borderColor: model.colors.border.hex,
                  marginRight: i < 2 ? 8 : 0,
                },
              ]}
            >
              <View
                style={{
                  width: 18,
                  height: 3,
                  backgroundColor: accent,
                  borderRadius: 2,
                  marginBottom: 6,
                }}
              />
              <Text style={[s.mockCardTitle, { fontFamily: headingFamily, color: text }]}>
                {card.title}
              </Text>
              <Text
                style={[
                  s.mockCardBody,
                  { fontFamily: bodyFamily, color: text, opacity: 0.75 },
                ]}
              >
                {card.body}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Specs + tokens row */}
      <View style={[s.row, { marginBottom: 10 }]}>
        <View style={[s.card, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
          <Text style={s.typeRole}>Component specs</Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily, marginTop: 6 }]}>
            Spacing base: {specs.spacingBase}px rhythm
          </Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily }]}>
            Radius: {specs.radiusSm}/{specs.radiusMd}/{specs.radiusLg}px · pills {specs.radiusPill}
          </Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily }]}>
            Body line-height: {specs.bodyLineHeight} · Heading: {specs.headingLineHeight}
          </Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily }]}>
            Max content width: {specs.maxContentWidth}px
          </Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily }]}>
            Primary CTA: bg {accent} · label {ctaText}
          </Text>
          <Text style={[s.bullet, { fontFamily: bodyFamily }]}>
            Secondary CTA: outline {accent} on {background}
          </Text>
        </View>

        <View style={[s.codeBlock, { flex: 1, marginTop: 0 }]}>
          <Text
            style={{
              fontSize: 7,
              color: "#94A3B8",
              marginBottom: 6,
              fontFamily: "Helvetica",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Design tokens (:root)
          </Text>
          {tokenLines.map((line) => (
            <Text key={line} style={s.codeBlockText}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      {/* Session history */}
      <Text style={s.sectionLabel}>
        Session palette history {history.length ? `(last ${history.length})` : ""}
      </Text>
      {history.length ? (
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCellBold, { width: "8%" }]}>#</Text>
            <Text style={[s.tableCellBold, { width: "28%" }]}>Label / source</Text>
            <Text style={[s.tableCellBold, { width: "14%" }]}>Emotion</Text>
            <Text style={[s.tableCellBold, { width: "50%" }]}>Palette</Text>
          </View>
          {history.map((h) => (
            <View key={`${h.index}-${h.label}`} style={s.tableRow} wrap={false}>
              <Text style={[s.tableCell, { width: "8%" }]}>{h.index}</Text>
              <View style={{ width: "28%" }}>
                <Text style={s.tableCellBold}>{h.label}</Text>
                <Text style={{ fontSize: 7, color: "#94A3B8", fontFamily: "Helvetica" }}>
                  {h.source}
                </Text>
              </View>
              <Text style={[s.tableCell, { width: "14%" }]}>{h.emotion || "—"}</Text>
              <View style={{ width: "50%", flexDirection: "row", alignItems: "center" }}>
                <MiniSwatch hex={h.background} size={12} />
                <MiniSwatch hex={h.text} size={12} />
                <MiniSwatch hex={h.accent} size={12} />
                <Text style={{ fontSize: 7, color: "#64748B", fontFamily: "Helvetica" }}>
                  {h.background} · {h.text} · {h.accent}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={s.cardMuted}>
          <Text style={[s.bodyText, { fontFamily: bodyFamily }]}>
            No palette history entries yet. Apply gallery palettes, extract from images, or save
            colors from the boards — future exports will list the last configurations here.
          </Text>
        </View>
      )}

      <Text
        style={{
          marginTop: 10,
          fontSize: 7.5,
          color: "#94A3B8",
          fontFamily: "Helvetica",
          lineHeight: 1.4,
        }}
      >
        End of brand book · Generated from SeeUI live workspace · Re-export after major palette or
        type changes to keep this document current.
      </Text>

      <PageFooter model={model} page={6} />
    </Page>
  );
}
