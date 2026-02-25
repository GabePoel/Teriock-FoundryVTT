import { FeatSaveExecution } from "../../../executions/activity-executions/_module.mjs";
import ModifierModel from "./modifier-model.mjs";

export default class AttributeModel extends ModifierModel {
  /** @type {number} */
  passive;

  /** @inheritDoc */
  get name() {
    return TERIOCK.options.attribute[this.key].name;
  }

  /** @inheritDoc */
  get quickValue() {
    return 2 * this.score;
  }

  /** @inheritDoc */
  get useText() {
    return game.i18n.format("TERIOCK.ROLLS.Feat.name", { value: this.name });
  }

  /** @inheritDoc */
  async _use(options) {
    options = {
      actor: this.actor,
      attribute: this.key,
      ...options,
    };
    const execution = new FeatSaveExecution(options);
    await execution.execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), {
      passive: this.passive,
      pas: this.passive,
    });
  }

  /** @inheritDoc */
  async use(options) {
    const data = {
      attribute: this.key,
      options,
    };
    await this.actor.hookCall("rollFeatSave", data);
    if (data.cancel) return;
    await super.use(Object.assign(options, { attribute: data.attribute }));
  }
}
