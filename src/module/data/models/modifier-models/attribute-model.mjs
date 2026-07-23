import BaseModifierModel from "./base-modifier-model.mjs";

const { fields } = foundry.data;

/**
 * A {@link BaseModifierModel} for attribute modifiers.
 * @see {FeatExecution}
 */
export default class AttributeModel extends BaseModifierModel {
  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.FeatExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      score: new fields.NumberField({ initial: -3, integer: true, max: 5, min: -3 }),
    });
  }

  /** @inheritDoc */
  get name() {
    return TERIOCK.config.attribute[this.key].label;
  }

  /**
   * Passive attribute value.
   * @returns {number}
   */
  get passive() {
    return 10 + this.score;
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.ROLLS.Feat.name", { value: this.name });
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), { passive: this.passive });
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.hookCall("rollFeatSave", { scope: { attribute: this.key } });
    await super.use(Object.assign(options, { attribute: this.key }));
  }
}
