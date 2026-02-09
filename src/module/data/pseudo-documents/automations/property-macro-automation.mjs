import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { BaseAutomation } from "./_module.mjs";

const { fields } = foundry.data;

/**
 * @property {UUID<TeriockMacro>} macro
 * @property {Teriock.Parameters.Shared.PropertyPseudoHook} pseudoHook
 */
export default class PropertyMacroAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Macro";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "propertyMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      macro: new fields.DocumentUUIDField({ type: "Macro", label: "Macro" }),
      pseudoHook: new fields.StringField({
        choices: propertyPseudoHooks,
        label: "Hook",
        hint: "The hook that executes this macro when fired.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["macro", "pseudoHook"];
  }
}
