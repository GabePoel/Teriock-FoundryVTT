import { TradecraftExecution } from "../../../executions/activity-executions/_module.mjs";
import BaseModifierModel from "./base-modifier-model.mjs";

const { fields } = foundry.data;

export default class TradecraftModel extends BaseModifierModel {
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
      actor: this.actor,
      tradecraft: this.key,
      ...options,
    };
    await new TradecraftExecution(options).execute();
  }

  /** @inheritDoc */
  async use(options) {
    await this.actor.hookCall("rollTradecraft", {
      scope: { tradecraft: this.key },
    });
    await super.use(Object.assign(options, { tradecraft: this.key }));
  }
}
