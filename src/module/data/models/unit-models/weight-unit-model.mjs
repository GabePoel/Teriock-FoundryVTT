import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class WeightUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { initialUnit: "lb", unitConfig: "weight", unlimited: false });

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.equipment.weight;
  }
}
