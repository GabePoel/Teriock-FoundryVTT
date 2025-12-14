import { TradecraftExecution } from "../../../executions/activity-executions/_module.mjs";
import ModifierModel from "./modifier-model.mjs";

export default class TradecraftModel extends ModifierModel {
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
