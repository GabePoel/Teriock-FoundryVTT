import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {string} abilityName
 */
export default class UseAbilityAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get TYPE() {
    return "useAbility";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      abilityName: new fields.StringField({
        label: "Ability Name",
        hint: "A different ability that this ability can cause the execution of.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["abilityName"];
  }
}
