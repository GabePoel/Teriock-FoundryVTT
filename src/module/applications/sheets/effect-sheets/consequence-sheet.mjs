import { makeIconClass } from "../../../utils/_module.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * Consequence sheet.
 * @property {TeriockActiveEffect<"consequence">} document
 * @mixes MechanicsSheet
 */
export default class ConsequenceSheet extends ApplicableEffectSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { position: { width: 600 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    ...super.PARTS,
    transformation: { scrollable: [""], template: "teriock/sheets/effects/consequence/transformation-tab" },
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    ...super.TABS,
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.effect.transform, "solid"),
        id: "transformation",
      }],
    },
  };

  /**
   * @inheritDoc
   * @category Transformation
   */
  async _prepareContext(options = {}) {
    const transformationPaths = ["enabled"];
    if (this.document.system.transformation.enabled) {
      transformationPaths.push(...["level", "attributes", "override"]);
      if (this.document.system.transformation.override.has("art")) {
        transformationPaths.push(...["ring", "img", "ringImg"]);
      }
      transformationPaths.push("primary");
    }
    return Object.assign(await super._prepareContext(options), {
      transformation: transformationPaths.map(p => {
        const entry = {
          field: this.document.system.schema.getField(`transformation.${p}`),
          localize: true,
          model: this.document.system,
          placeholder: p === "primary" ? undefined : this.document.system.transformation[p],
          value: this.document.system._source.transformation[p],
        };
        if (TERIOCK.CONFIG.transformation.multiCheckboxPaths.includes(p)) {
          entry.input = (field, ic) => {
            ic.choices = field.element.choices;
            foundry.data.fields.StringField._prepareChoiceConfig(ic);
            return foundry.applications.elements.HTMLMultiCheckboxElement.create(ic);
          };
        }
        return entry;
      }),
    });
  }
}
