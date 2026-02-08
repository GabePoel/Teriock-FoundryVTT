import { BaseAutomation } from "./_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} crit
 */
export default class CritAutomation extends BaseAutomation {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      crit: new fields.BooleanField({
        label: "Crit",
        hint: "Whether this automation applies only on a crit.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "crit"];
  }
}
