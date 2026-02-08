import { abilityPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {"button"|"pseudoHook"} relation
 */
export default class AbilityMacroAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Macro";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "abilityMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      macro: new fields.DocumentUUIDField({ type: "Macro", label: "Macro" }),
      relation: new fields.StringField({
        choices: {
          button: "Button",
          pseudoHook: "Hook",
        },
        initial: "button",
        label: "Relation",
        hint: "Whether this macro can be run as a button from the chat message or hooks into some other behavior.",
      }),
      pseudoHook: new fields.StringField({
        choices: abilityPseudoHooks,
        label: "Hook",
        hint: "The hook that executes this macro when fired.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["macro", "relation"];
    if (this.relation === "pseudoHook") {
      paths.push("pseudoHook");
    }
    return paths;
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "pseudoHook" && super.canCrit;
  }
}
