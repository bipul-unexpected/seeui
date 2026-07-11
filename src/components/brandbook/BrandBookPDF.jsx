/**
 * BrandBookPDF — professional multi-page A4 Brand Style Guide
 *
 * Pages:
 *   01 Cover + executive workspace summary
 *   02 Emotion strategy & avoid list
 *   03 Color system (HEX/RGB/CMYK + usage)
 *   04 Accessibility (full WCAG matrix)
 *   05 Typography hierarchy & live type settings
 *   06 UI application, tokens, session history
 */

import { Document } from "@react-pdf/renderer";
import { registerBrandBookFonts } from "../../utils/registerBrandFonts";
import { buildBrandBookModel } from "./brandBookHelpers";
import CoverPage from "./CoverPage";
import StrategyPage from "./StrategyPage";
import ColorSystemPage from "./ColorSystemPage";
import AccessibilityPage from "./AccessibilityPage";
import TypographyPage from "./TypographyPage";
import UIApplicationPage from "./UIApplicationPage";

/**
 * @param {object} props — full workspace snapshot (see buildBrandBookModel)
 */
export default function BrandBookPDF(props) {
  const pdfFonts =
    props.pdfFonts || registerBrandBookFonts(props.typography || {});

  const model = buildBrandBookModel({
    ...props,
    pdfFonts,
  });
  model.pdfFonts = pdfFonts;

  const title = `${model.brandName} Brand Style Guidelines — ${model.emotion.label}`;

  return (
    <Document
      title={title}
      author={model.brandName}
      subject={`Live workspace brand book · ${model.emotion.label} · ${model.generatedDisplay}`}
      creator="SeeUI Emotion Color Psychology Generator"
      producer="SeeUI @react-pdf/renderer"
      keywords={`brand, style guide, ${model.emotion.label}, WCAG, CMYK, psychology, typography`}
      language="en"
    >
      <CoverPage model={model} />
      <StrategyPage model={model} />
      <ColorSystemPage model={model} />
      <AccessibilityPage model={model} />
      <TypographyPage model={model} />
      <UIApplicationPage model={model} />
    </Document>
  );
}

export {
  CoverPage,
  StrategyPage,
  ColorSystemPage,
  AccessibilityPage,
  TypographyPage,
  UIApplicationPage,
  buildBrandBookModel,
};
