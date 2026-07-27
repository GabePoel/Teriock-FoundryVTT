import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
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
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, { icon: makeIconClass(icons.effect.transform, "solid"), id: "transformation" }],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const transformationPaths = ["enabled"];
    if (this.document.system.transformation.enabled) {
      transformationPaths.push(...["level", "override"]);
      if (this.document.system.transformation.override.has("art")) {
        transformationPaths.push(...["ring", "img", "ringImg"]);
      }
    }
    return Object.assign(await super._prepareContext(options), {
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
