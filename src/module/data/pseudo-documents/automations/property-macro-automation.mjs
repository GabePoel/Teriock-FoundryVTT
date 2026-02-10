import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import BaseAutomation from "./base-automation.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {UUID<TeriockMacro>} macro
 * @property {Teriock.Parameters.Shared.PropertyPseudoHook} pseudoHook
 */
export default class PropertyMacroAutomation extends MacroAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "propertyMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      pseudoHook: new fields.StringField({
        choices: propertyPseudoHooks,
        label: "Hook",
        hint: "The hook that executes this macro when fired.",
      }),
    });
  }
}
