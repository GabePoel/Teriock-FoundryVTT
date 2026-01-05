import { TradecraftExecution } from "../../../executions/activity-executions/_module.mjs";
import ModifierModel from "./modifier-model.mjs";

const { fields } = foundry.data;

export default class TradecraftModel extends ModifierModel {
  /** @inheritDoc */
  static defineSchema(options = {}) {
    const { score = 0 } = options;
    return {
      ...super.defineSchema(options),
      score: new fields.NumberField({ initial: score, min: 0, max: 3 }),
    };
  }

  /** @inheritDoc */
  async _use(options) {
    options = {
      tradecraft: this.key,
      actor: this.actor,
      ...options,
    };
    const execution = new TradecraftExecution(options);
    await execution.execute();
  }

  /** @inheritDoc */
  async use(options) {
    const data = {
      tradecraft: this.key,
      options,
    };
    await this.actor.hookCall("rollTradecraft", data);
    if (data.cancel) {
      return;
    }
    options = {
      ...options,
      tradecraft: data.tradecraft,
    };
    await this._use(options);
  }
}
