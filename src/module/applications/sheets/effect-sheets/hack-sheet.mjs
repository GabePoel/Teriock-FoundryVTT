import { omit } from "../../../helpers/utils.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * @import { ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

export default class CustomEffectSheet extends ApplicableEffectSheet {
  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = omit(ApplicableEffectSheet.PARTS, ["children"]);

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    ...super.TABS,
    sheet: { ...super.TABS.sheet, tabs: super.TABS.sheet.tabs.filter(tab => tab.id !== "children") },
  };
}
