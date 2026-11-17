import { makeIconClass } from "../../../utils/_module.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * Dependee sheet.
 * @property {TeriockActiveEffect} document
 * @mixes MechanicsSheet
 */
export default class DependeeSheet extends ApplicableEffectSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { position: { width: 600 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    ...super.PARTS,
    morph: { scrollable: [""], template: "teriock/sheets/effects/consequence/morph-tab" },
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    ...super.TABS,
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.effect.morph, "solid"),
        id: "morph",
      }],
    },
  };

  /**
   * @inheritDoc
   * @category Morph
   */
  async _prepareContext(options = {}) {
    const morphPaths = ["enabled"];
    if (this.document.system.morph.enabled) {
      morphPaths.push(...["attributes", "override"]);
      if (this.document.system.morph.override.has("art")) {
        morphPaths.push(...["ring", "img", "ringImg"]);
      }
      if (this.document.actor) { morphPaths.push("primary"); }
    }
    return Object.assign(await super._prepareContext(options), {
      morph: morphPaths.map(p => {
        const entry = {
          field: this.document.system.schema.getField(`morph.${p}`),
          localize: true,
          model: this.document.system,
          placeholder: p === "primary" ? undefined : this.document.system.morph[p],
          value: this.document.system._source.morph[p],
        };
        if (TERIOCK.CONFIG.morph.multiCheckboxPaths.includes(p)) {
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
