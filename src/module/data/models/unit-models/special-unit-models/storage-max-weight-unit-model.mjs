import { mergeMetadata } from "../../../../utils/_module.mjs";
import WeightUnitModel from "../normal-unit-models/weight-unit-model.mjs";

/**
 * A weight model with special handling for going infinite.
 */
export default class StorageMaxWeightUnitModel extends WeightUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.equipment.maxWeight,
    unitOptions: { initial: "unlimited" },
    unlimited: true,
  });

  /** @inheritDoc */
  prepareUpdaterContext() {
    const carried = this.parent.storage.weight.value;
    const format = max =>
      max.unitType === "finite"
        ? _loc("TERIOCK.FORMAT.outOf", {
          denominator: max.converted,
          numerator: (carried / max.conversion).toNearest(TERIOCK.CONST.UNIT_PRECISION),
        })
        : String(carried);
    const context = { ...super.prepareUpdaterContext(), data: format(this), source: format(this.clone()) };
    // Weight carried without a maximum is in pounds
    if (this.unitType !== "finite") {
      context.abbreviation = _loc("TERIOCK.WEIGHT.lb.symbol");
      context.abbreviationTooltip = _loc("TERIOCK.WEIGHT.lb.plural");
    }
    return context;
  }
}
