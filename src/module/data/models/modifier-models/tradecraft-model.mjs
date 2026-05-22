import { TradecraftExecution } from "../../../executions/activity-executions/_module.mjs";
import BaseModifierModel from "./base-modifier-model.mjs";

const { fields } = foundry.data;

export default class TradecraftModel extends BaseModifierModel {
  /** @inheritDoc */
  static defineSchema(options = {}) {
    return Object.assign(super.defineSchema(options), {
      score: new fields.NumberField({ initial: options.score ?? 0, integer: true, max: 3, min: 0 }),
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
  async _use(options) {
    options = { actor: this.actor, tradecraft: this.key, ...options };
    await new TradecraftExecution(options).execute();
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.hookCall("rollTradecraft", { scope: { tradecraft: this.key } });
    await super.use(Object.assign(options, { tradecraft: this.key }));
  }
}
