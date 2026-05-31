import { mixClasses } from "../../../helpers/construction.mjs";
import { initialString } from "../../fields/helpers/initializers.mjs";
import * as dataMixins from "../../shared/mixins/_module.mjs";
import EvaluationModel from "../evaluation-model.mjs";

const { fields } = foundry.data;

/**
 * @extends {EvaluationModel}
 * @extends {Teriock.Models.BaseModifierModelData}
 * @mixes ThresholdData
 * @mixes UsableData
 */
export default class BaseModifierModel
  extends mixClasses(EvaluationModel, dataMixins.UsableDataMixin, dataMixins.ThresholdDataMixin)
{
  /** @inheritDoc */
  static defineSchema(options = {}) {
    return Object.assign(super.defineSchema(options), {
      _key: initialString(),
      score: new fields.NumberField({ initial: options.score ?? 0, integer: true, nullable: false }),
    });
  }

  /**
   * Modify a value with proficiency and fluency.
   * @param {number} value
   * @returns {number}
   */
  #modify(value) {
    return value + this.competence.bonus;
  }

  /** @inheritDoc */
  get currentValue() {
    return this.#modify(super.currentValue);
  }

  /**
   * A key identifying this executable.
   * @returns {string}
   */
  get key() {
    return this._key || "";
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return this.schema.fields.raw.label;
  }

  /** @inheritDoc */
  get value() {
    return this.#modify(super.value);
  }

  /** @inheritDoc */
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), { "": this.value, score: this.score });
  }
}
