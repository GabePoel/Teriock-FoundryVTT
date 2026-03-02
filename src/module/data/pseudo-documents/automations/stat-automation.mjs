import BaseAutomation from "./base-automation.mjs";
import { TriggerAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} consumeStatDice
 * @param {boolean} forHarm
 */
export default class StatAutomation extends TriggerAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.StatAutomation",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumeStatDice: new fields.BooleanField({ initial: true }),
      forHarm: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["consumeStatDice", "forHarm", ...super._formPaths];
  }
}
