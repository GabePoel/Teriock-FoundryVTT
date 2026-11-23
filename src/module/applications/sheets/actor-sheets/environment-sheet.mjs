import { omit } from "../../../utils/_module.mjs";
import { PlayableActorSheet } from "./abstract/_module.mjs";

/**
 * @import { ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

const OMITTED_SECTIONS = ["classes", "sorcery", "tradecrafts"];

/**
 * Environment sheet.
 * @property {TeriockActor<"environment">} actor
 * @property {TeriockActor<"environment">} document
 */
export default class EnvironmentSheet extends PlayableActorSheet {
  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = omit(super.PARTS, OMITTED_SECTIONS);

  /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
  static PREVIEWS = omit(super.PREVIEWS, OMITTED_SECTIONS);

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    primary: { initial: "abilities", tabs: super.TABS.primary.tabs.filter(tab => !OMITTED_SECTIONS.includes(tab.id)) },
  };
}
