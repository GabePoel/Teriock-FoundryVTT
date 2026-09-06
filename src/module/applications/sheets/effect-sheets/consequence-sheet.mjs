import { icons } from "../../../constants/display/_module.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentSelector } from "../../dialogs/_module.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import { ActiveEffectConfig } from "@client/applications/sheets/_module.mjs";
 */

/**
 * Consequence sheet.
 * @property {TeriockActiveEffect<"consequence">} document
 * @mixes MechanicsSheet
 */
export default class ConsequenceSheet extends ApplicableEffectSheet {
  /**
   * Select the primary transformation species for this consequence.
   * @returns {Promise<void>}
   */
  static async #onSelectPrimarySpecies() {
    if (!this.isEditable || !this.document.system.isTransformation) { return; }
    const selected = await DocumentSelector.selectSingle(this.document.previewedTypes.species, {
      auto: false,
      checked: this.document.system.primarySpecies?.uuid,
      hint: _loc("TERIOCK.SHEETS.Consequence.ACTIONS.SelectPrimarySpecies.hint"),
      openable: true,
      title: _loc("TERIOCK.SHEETS.Consequence.ACTIONS.SelectPrimarySpecies.title"),
    });
    if (!selected) { return; }
    await this.document.update({ "system.transformation.primary": selected.id });
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { selectPrimarySpecies: this.#onSelectPrimarySpecies },
    position: { width: 600 },
  };

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
        icon: makeIconClass(icons.manifest.effect.transform, "solid"),
        id: "transformation",
      }],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const transformationPaths = ["enabled"];
    const showPrimarySpecies = this.document.system.transformation.enabled;
    if (showPrimarySpecies) {
      transformationPaths.push(...["level", "override"]);
      if (this.document.system.transformation.override.has("art")) {
        transformationPaths.push(...["ring", "img", "ringImg"]);
      }
    }
    return Object.assign(await super._prepareContext(options), {
      primarySpecies: showPrimarySpecies ? this.document.system.primarySpecies : null,
      showPrimarySpecies,
      transformation: transformationPaths.map(p => {
        return {
          field: this.document.system.schema.getField(`transformation.${p}`),
          localize: true,
          placeholder: this.document.system.transformation[p],
          value: this.document.system._source.transformation[p],
        };
      }),
    });
  }
}
