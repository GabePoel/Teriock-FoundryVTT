import { mergeMetadata } from "../../../utils/_module.mjs";
import WeightUnitModel from "./weight-unit-model.mjs";

/**
 * A weight model with some special handling for default values calculated
 * from an Actor's size.
 */
export default class ActorWeightUnitModel extends WeightUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    rawOptions: { initial: null, nullable: true, placeholder: "COMMON.Default" },
  });

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
    return this.raw === null;
  }

  /** @inheritDoc */
  get rollValue() {
    return this.isDefault ? this.defaultValue : super.rollValue;
  }

  /** @inheritDoc */
  get value() {
    return this.isDefault ? this.defaultValue : super.value;
  }
}
