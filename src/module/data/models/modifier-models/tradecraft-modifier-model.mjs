import { getName } from "../../../utils/_module.mjs";
import BaseModifierModel from "./base-modifier-model/base-modifier-model.mjs";

/**
 * A {@link BaseModifierModel} for tradecraft modifiers.
 * @see {TradecraftCheckExecution}
 */
export default class TradecraftModifierModel extends BaseModifierModel {
  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.TradecraftCheckExecution;
  }

  /** @inheritDoc */
  get name() {
    return getName(`tradecraft:${this.key}`);
  }

  /** @inheritDoc */
  get term() {
    return `@tc.${this.key}.score`;
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
