import BaseModifierModel from "./base-modifier-model.mjs";

const { fields } = foundry.data;

/**
 * A {@link BaseModifierModel} for tradecraft modifiers.
 * @see {TradecraftExecution}
 */
export default class TradecraftModel extends BaseModifierModel {
  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.TradecraftExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      score: new fields.NumberField({ initial: 0, integer: true, max: 3, min: 0 }),
    });
  }

  /** @inheritDoc */
  get name() {
    return TERIOCK.reference.tradecrafts[this.key];
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.ROLLS.Tradecraft.name", { value: this.name });
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.hookCall("rollTradecraft", { scope: { tradecraft: this.key } });
    await super.use(Object.assign(options, { tradecraft: this.key }));
  }
}
