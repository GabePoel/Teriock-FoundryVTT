import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} crit
 */
export default class CritAutomation extends BaseAutomation {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      crit: new fields.SetField(
        new fields.NumberField({
          choices: {
            0: "Non-Crit",
            1: "Crit",
          },
        }),
        {
          initial: [0, 1],
        },
      ),
    });
  }

  /** @inheritDoc */
  get canCrit() {
    if (this.document.type === "ability") return true;
    return super.canCrit;
  }
}
