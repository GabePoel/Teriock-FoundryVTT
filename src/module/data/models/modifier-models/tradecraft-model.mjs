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
  get name() {
    return TERIOCK.reference.tradecrafts[this.key];
  }

  /** @inheritDoc */
  get useText() {
    return game.i18n.format("TERIOCK.ROLLS.Tradecraft.name", {
      value: this.name,
    });
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
    if (data.cancel) return;
    await super.use(Object.assign(options, { tradecraft: data.tradecraft }));
  }
}
