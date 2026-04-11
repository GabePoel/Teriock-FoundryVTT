import { mix } from "../../../helpers/construction.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import {
  ThresholdDataMixin,
  UsableDataMixin,
} from "../../shared/mixins/_module.mjs";
import EvaluationModel from "../evaluation-model.mjs";

const { fields } = foundry.data;

/**
 * @mixes UsableData
 * @extends {EvaluationModel}
 * @extends {Teriock.Models.BaseModifierModelData}
 */
export default class BaseModifierModel extends mix(
  EvaluationModel,
  UsableDataMixin,
  ThresholdDataMixin,
) {
  /** @inheritDoc */
  static defineSchema(options = {}) {
    const { score = 0 } = options;
    return {
      ...super.defineSchema(options),
      score: new fields.NumberField({ initial: score }),
    };
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
    return toCamelCase(this.schema.fields.raw.label);
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return this.schema.fields.raw.label;
  }

  /** @inheritDoc */
  get quickValue() {
    return this.score;
  }

  /** @inheritDoc */
  get value() {
    return this.#modify(super.value);
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
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), {
      "": this.value,
      score: this.score,
    });
  }
}
