import { FeatSaveExecution } from "../../../executions/activity-executions/_module.mjs";
import ModifierModel from "./modifier-model.mjs";

export default class AttributeModel extends ModifierModel {
  /** @type {number} */
  passive;

  /** @inheritDoc */
  async _use(options) {
    options = {
      attribute: this.key,
      actor: this.actor,
      ...options,
    };
    const execution = new FeatSaveExecution(options);
    await execution.execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    const localRollData = super.getLocalRollData();
    Object.assign(localRollData, {
      passive: this.passive,
      pas: this.passive,
    });
    return localRollData;
  }

  /** @inheritDoc */
  async use(options) {
    const data = {
      attribute: this.key,
      options,
    };
    await this.actor.hookCall("rollFeatSave", data);
    if (data.cancel) {
      return;
    }
    options = {
      ...options,
      attribute: data.attribute,
    };
    await this._use(options);
  }
}
