import { initialNumber } from "../fields/helpers/initializers.mjs";
import EvaluationModel from "./evaluation-model.mjs";

export default class DefenseModel extends EvaluationModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: initialNumber(0),
    });
  }

  /** @inheritDoc */
  get currentValue() {
    return this.#modify(super.currentValue);
  }

  /** @inheritDoc */
  get value() {
    return this.#modify(super.value);
  }

  /**
   * Modify a value with bonus.
   * @param {number} value
   * @returns {number}
   */
  #modify(value) {
    return value + this.bonus;
  }
}
