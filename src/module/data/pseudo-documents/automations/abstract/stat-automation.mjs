import * as automationMixins from "../mixins/_module.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} consumeStatDice
 * @param {boolean} forHarm
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class StatAutomation extends automationMixins.TriggerAutomationMixin(CritAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Stat"];

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { activationTime: "on" });
  }

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
