/**
 * Shared PDF primitives for the Brand Book.
 */

import { View, Text } from "@react-pdf/renderer";
import { brandBookStyles as s } from "./brandBookStyles";
import { formatWcagBadge, pageLabel } from "./brandBookHelpers";

export function PageChrome({ model, title, page, rightMeta }) {
  const headingFamily = model.pdfFonts?.heading || "Helvetica";
  return (
    <View style={s.pageHeader}>
      <View>
        <Text
          style={{
            fontSize: 7,
            color: "#94A3B8",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 3,
            fontFamily: "Helvetica",
          }}
        >
          {model.brandName} · {model.documentTitle}
        </Text>
        <Text style={[s.pageHeaderTitle, { fontFamily: headingFamily }]}>
          {title}
        </Text>
      </View>
      <Text style={s.pageHeaderMeta}>
        {rightMeta || pageLabel(page, model.totalPages)}
      </Text>
    </View>
  );
}

export function PageFooter({ model, page }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>
        {model.brandName} · {model.emotion.label} system · {model.generatedDisplay}
      </Text>
      <Text style={s.pageFooterText}>
        {pageLabel(page, model.totalPages)}
      </Text>
    </View>
  );
}

export function WcagBadge({ report }) {
  const badge = formatWcagBadge(report);
  const isLargeOnly = report?.level === "AA Large" && !report?.pass;
  if (isLargeOnly) {
    return (
      <View style={s.badgeWarn}>
        <Text style={s.badgeWarnText}>{badge.text}</Text>
      </View>
    );
  }
  return (
    <View style={badge.pass ? s.badgePass : s.badgeFail}>
      <Text style={badge.pass ? s.badgePassText : s.badgeFailText}>
        {badge.text}
      </Text>
    </View>
  );
}

export function MiniSwatch({ hex, size = 10 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        backgroundColor: hex,
        borderWidth: 0.5,
        borderColor: "#CBD5E1",
        marginRight: 4,
      }}
    />
  );
}

export function CodeLines({ codes }) {
  return (
    <View>
      <Text style={s.codeLine}>
        <Text style={s.codeLabel}>HEX    </Text>
        {codes.hex}
      </Text>
      <Text style={s.codeLine}>
        <Text style={s.codeLabel}>RGB    </Text>
        {codes.rgbString}
      </Text>
      <Text style={s.codeLine}>
        <Text style={s.codeLabel}>CMYK   </Text>
        {codes.cmykString}
      </Text>
    </View>
  );
}

export function Kpi({ label, value, sub }) {
  return (
    <View style={s.kpiItem}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
      {sub ? <Text style={s.kpiSub}>{sub}</Text> : null}
    </View>
  );
}
