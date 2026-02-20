import { UseAbilityHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<string>} abilityNames
 */
export default class UseAbilitiesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseAbilitiesAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseAbilitiesAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useAbility";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      abilityNames: new fields.SetField(new fields.StringField()),
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
