import { mergeMetadata } from "../../../../utils/_module.mjs";
import ArmamentRangeUnitModel from "./armament-range-unit-model.mjs";

export default class ArmamentReachUnitModel extends ArmamentRangeUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { unitOptions: { initial: "ft" } });
}
