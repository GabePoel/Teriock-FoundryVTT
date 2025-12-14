import { FeatSaveExecution } from "../../../executions/activity-executions/_module.mjs";
import { EvaluationField } from "../../fields/_module.mjs";
import ModifierModel from "./modifier-model.mjs";

/**
 * @property {EvaluationModel} passive
 */
export default class AttributeModel extends ModifierModel {
  /** @inheritDoc */
  static defineSchema(options = {}) {
    const schema = super.defineSchema(options);
    schema.passive = new EvaluationField({
      deterministic: true,
      floor: true,
      initial: `@att.${(options?.label || "").toLowerCase()} * 2 + 10`,
      label: `Passive ${options?.label || ""} Value`,
    });
    return schema;
  }

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
  getLocalRollData(prefix) {
    const localRollData = super.getLocalRollData(prefix);
    if (prefix) localRollData[`${prefix}.passive`] = this.passive.value;
    else localRollData.passive = this.passive.value;
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
