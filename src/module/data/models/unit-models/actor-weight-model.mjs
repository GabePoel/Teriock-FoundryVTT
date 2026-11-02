import WeightUnitModel from "./weight-unit-model.mjs";

/**
 * A weight model with some special handling for default values calculated
 * from an Actor's size.
 */
export default class ActorWeightModel extends WeightUnitModel {
  /** @inheritDoc */
  static get _rawPlaceholder() {
    return _loc("COMMON.Default");
  }

  /**
   * The default weight given the Actor's current size.
   * @returns {number}
   */
  get defaultValue() {
    const size = this.parent?.size?.value ?? 3;
    return CONFIG.Actor.documentClass.getDefaultWeight(size).toNearest(TERIOCK.CONST.UNIT_PRECISION);
  }

  /**
   * Whether to use default weight.
   * @returns {boolean}
   */
  get isDefault() {
    return !this.raw?.trim();
  }

  /** @inheritDoc */
  evaluate(rollData = {}) {
    if (this.isDefault) { this.value = this.defaultValue; }
    else { super.evaluate(rollData); }
  }
}
