/**
 * Page 3 — Color System (print codes + usage matrix + derived tokens)
 */

import { Page, View, Text } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { PageChrome, PageFooter, CodeLines } from "./shared";

function SwatchRow({ name, role, codes, headingFamily, note }) {
  return (
    <View style={s.swatchRow} wrap={false}>
      <View style={[s.swatchBlock, { backgroundColor: codes.hex }]} />
      <View style={s.swatchMeta}>
        <Text style={[s.swatchName, { fontFamily: headingFamily }]}>{name}</Text>
        <Text
          style={{
            fontSize: 7.5,
            color: "#94A3B8",
            marginBottom: 4,
            fontFamily: "Helvetica",
          }}
        >
          {role}
        </Text>
        <CodeLines codes={codes} />
        {note ? (
          <Text
            style={{
              fontSize: 7.5,
              color: "#64748B",
              marginTop: 4,
              fontFamily: "Helvetica",
            }}
          >
            {note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ColorSystemPage({ model }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  const bodyFamily = model.pdfFonts?.body || "Helvetica";

  return (
    <Page size="A4" style={s.page}>
      <PageChrome model={model} title="Color System" page={3} rightMeta="03 · Print & digital" />

      <Text style={s.sectionLabel}>Core palette (from workspace)</Text>

      <SwatchRow
        name="Primary / Accent"
        role="CTAs · links · focus · brand emphasis"
        codes={model.colors.accent}
        headingFamily={headingFamily}
        note="Highest chroma signal — use sparingly for interaction."
      />
      <SwatchRow
        name="Text / Ink"
        role="Body · headings · icons · chrome"
        codes={model.colors.text}
        headingFamily={headingFamily}
        note={
          model.textIsAuto
            ? "Derived automatically for contrast against background."
            : "Manually selected on the color board."
        }
      />
      <SwatchRow
        name="Background / Canvas"
        role="Surfaces · page fills · app shell"
        codes={model.colors.background}
        headingFamily={headingFamily}
        note={`${model.mode === "dark" ? "Dark" : "Light"} mode canvas · luminance ${(model.luminance.background * 100).toFixed(1)}%`}
      />

      <Text style={[s.sectionLabel, { marginTop: 6 }]}>Derived supporting colors</Text>
      <View style={[s.row, { marginBottom: 8 }]}>
        {[
          { name: "Muted text", codes: model.colors.muted, use: "Captions, meta" },
          { name: "Surface", codes: model.colors.surface, use: "Cards, panels" },
          { name: "Border", codes: model.colors.border, use: "Dividers, strokes" },
          { name: "Accent soft", codes: model.colors.accentSoft, use: "Chips, soft fills" },
        ].map((item, i) => (
          <View
            key={item.name}
            style={{
              flex: 1,
              marginRight: i < 3 ? 6 : 0,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View style={{ height: 28, backgroundColor: item.codes.hex }} />
            <View style={{ padding: 6 }}>
              <Text style={{ fontSize: 8, fontWeight: 700, fontFamily: headingFamily }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 7, color: "#64748B", fontFamily: "Helvetica" }}>
                {item.codes.hex}
              </Text>
              <Text style={{ fontSize: 7, color: "#94A3B8", fontFamily: "Helvetica" }}>
                {item.use}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={s.sectionLabel}>Usage matrix</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableCellBold, { width: "22%" }]}>Role</Text>
          <Text style={[s.tableCellBold, { width: "14%" }]}>HEX</Text>
          <Text style={[s.tableCellBold, { width: "28%" }]}>Use for</Text>
          <Text style={[s.tableCellBold, { width: "18%" }]}>Do</Text>
          <Text style={[s.tableCellBold, { width: "18%" }]}>Don&apos;t</Text>
        </View>
        {model.usageRoles.map((row) => (
          <View key={row.role} style={s.tableRow} wrap={false}>
            <View style={{ width: "22%", flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: row.hex,
                  marginRight: 4,
                  borderWidth: 0.5,
                  borderColor: "#CBD5E1",
                }}
              />
              <Text style={[s.tableCellBold, { flex: 1 }]}>{row.role}</Text>
            </View>
            <Text style={[s.tableCell, { width: "14%" }]}>{row.hex}</Text>
            <Text style={[s.tableCell, { width: "28%", fontFamily: bodyFamily }]}>
              {row.usage}
            </Text>
            <Text style={[s.tableCell, { width: "18%", fontFamily: bodyFamily }]}>
              {row.do}
            </Text>
            <Text style={[s.tableCell, { width: "18%", fontFamily: bodyFamily }]}>
              {row.dont}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={{
          marginTop: 10,
          fontSize: 7.5,
          color: "#94A3B8",
          lineHeight: 1.45,
          fontFamily: "Helvetica",
        }}
      >
        CMYK is estimated from sRGB for brand-guide reference (not ICC soft-proof). Soft-proof with
        your print vendor before production. RGB channels 0–255 · CMYK 0–100.
      </Text>

      <PageFooter model={model} page={3} />
    </Page>
  );
}
