const { api } = foundry.applications;
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import { TeriockAbilityMixin } from "../../mixins/ability-mixin/ability-mixin.mjs";

/**
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockAbilitySheet extends api.HandlebarsApplicationMixin(
  TeriockAbilityMixin(TeriockBaseEffectSheet)
) {
  static PARTS = {
    all: {
      template: "systems/teriock/templates/sheets/ability-template/ability-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };
  
  constructor(...args) {
    super(...args);
  }
}
