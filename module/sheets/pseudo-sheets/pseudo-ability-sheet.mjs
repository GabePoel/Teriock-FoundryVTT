const { api } = foundry.applications;
import PseudoApplication from "./pseudo-application.mjs";
import { TeriockAbilityMixin } from "../mixins/ability-mixin/ability-mixin.mjs";

/**
 * @extends {PseudoApplication}
 */
export default class PseudoAbilitySheet extends api.HandlebarsApplicationMixin(
  TeriockAbilityMixin(PseudoApplication)
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