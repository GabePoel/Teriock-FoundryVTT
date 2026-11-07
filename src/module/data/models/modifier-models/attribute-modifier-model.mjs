import { mergeMetadata } from "../../../utils/construction.mjs";
import BaseModifierModel from "./base-modifier-model/base-modifier-model.mjs";

/**
 * A {@link BaseModifierModel} for attribute modifiers.
 * @see {FeatExecution}
 */
export default class AttributeModifierModel extends BaseModifierModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { initialMultiplier: 2, initialScore: -3 });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.FeatExecution;
  }

  /** @inheritDoc */
  get name() {
    return TERIOCK.CONFIG.attribute[this.key].label;
  }

  /**
   * Passive attribute value.
   * @returns {number}
   */
  get passive() {
    return 10 + this.score * 2;
  }

  /** @inheritDoc */
  get term() {
    return `@${this.key}.score`;
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
    await this.actor.fireTrigger("rollFeatSave", { attribute: this.key });
    await super.use(Object.assign(options, { source: this }));
  }
}
