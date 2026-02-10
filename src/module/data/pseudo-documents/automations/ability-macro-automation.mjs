import { abilityPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import CritAutomation from "./crit-automation.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

export default class AbilityMacroAutomation extends MacroAutomationMixin(
  CritAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "abilityMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      pseudoHook: new fields.StringField({
        choices: abilityPseudoHooks,
        label: "Hook",
        hint: "The hook that executes this macro when fired.",
      }),
    });
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "pseudoHook" && super.canCrit;
  }
}
