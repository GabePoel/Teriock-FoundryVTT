import EvaluationModel from "./evaluation-model.mjs";

export default class DefenseModel extends EvaluationModel {
  /** @inheritDoc */
  constructor(...args) {
    super(...args);
    this.bonus = 0;
  }

  /** @type {number} */
  bonus;

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
