import { mergeMetadata } from "../../../utils/_module.mjs";
import WeightUnitModel from "./weight-unit-model.mjs";

/**
 * A weight model with special handling for going infinite.
 */
export default class StorageMaxWeightModel extends WeightUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { initialUnit: "unlimited", unlimited: true });

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.equipment.maxWeight;
  }
}
