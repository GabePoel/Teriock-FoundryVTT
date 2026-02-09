import { UseAbilityHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<string>} abilityNames
 */
export default class UseAbilitiesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Use Abilities";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useAbility";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      abilityNames: new fields.SetField(new fields.StringField(), {
        label: "Abilities",
        hint: "Abilities that this can directly cause the execution of.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["abilityNames"];
  }

  /** @inheritDoc */
  get buttons() {
    return Array.from(this.abilityNames).map((an) =>
      UseAbilityHandler.buildButton(an),
    );
  }
}
