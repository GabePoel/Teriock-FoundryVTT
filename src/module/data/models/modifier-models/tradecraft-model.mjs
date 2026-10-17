import { getName } from "../../../utils/_module.mjs";
import BaseModifierModel from "./base-modifier-model/base-modifier-model.mjs";

const { fields } = foundry.data;

/**
 * A {@link BaseModifierModel} for tradecraft modifiers.
 * @see {TradecraftCheckExecution}
 */
export default class TradecraftModel extends BaseModifierModel {
  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.TradecraftCheckExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      score: new fields.NumberField({ initial: 0, integer: true, required: true }),
    });
  }

  /** @inheritDoc */
  get name() {
    return getName(`tradecraft:${this.key}`);
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.ROLLS.Tradecraft.name", { value: this.name });
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.fireTrigger("rollTradecraft", { tradecraft: this.key });
    await super.use(Object.assign(options, { source: this }));
  }
}
