import { omit } from "../../../helpers/utils.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

export default class CustomEffectSheet extends ApplicableEffectSheet {
  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = omit(ApplicableEffectSheet.PARTS, ["children"]);

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = { sheet: { ...super.TABS.sheet, tabs: super.TABS.sheet.tabs.filter(tab => tab.id !== "children") } };
}
