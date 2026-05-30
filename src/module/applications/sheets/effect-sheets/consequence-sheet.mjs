import documentConfig from "../../../constants/config/document-config.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 * @mixes AutomationsCommonSheetPart
 */
export default class ConsequenceSheet extends ApplicableEffectSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    window: { icon: makeIconClass(documentConfig.consequence.icon, "title") },
  };

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    transformation: { scrollable: [""], template: "teriock/sheets/effects/consequence/transformation-tab" },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, { icon: makeIconClass(icons.effect.transform, "solid"), id: "transformation" }],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      transformation: ["enabled", "level", "img", "ring"].map(p => {
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
