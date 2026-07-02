import { FeatExecution } from "../../../executions/activity-executions/_module.mjs";
import { initialNumber } from "../../fields/tools/initializers.mjs";
import BaseModifierModel from "./base-modifier-model.mjs";

/**
 * A {@link BaseModifierModel} for attribute modifiers.
 * @property {number} passive
 * @see {FeatExecution}
 */
export default class AttributeModel extends BaseModifierModel {
  /** @inheritDoc */
  static defineSchema(options) {
    return Object.assign(super.defineSchema(options), { passive: initialNumber(4) });
  }

  /** @inheritDoc */
  get name() {
    return TERIOCK.config.attribute[this.key].label;
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.ROLLS.Feat.name", { value: this.name });
  }

  /** @inheritDoc */
  async _use(options) {
    await FeatExecution.create({ actor: this.actor, attribute: this.key, ...options });
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), { pas: this.passive });
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.hookCall("rollFeatSave", { scope: { attribute: this.key } });
    await super.use(Object.assign(options, { attribute: this.key }));
  }
}
