import { mergeMetadata } from "../../../../utils/_module.mjs";
import BaseUnitModel from "../base-unit-model/base-unit-model.mjs";

export default class WeightUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.equipment.weight,
    unitConfig: "weight",
    unitOptions: { initial: "lb" },
  });
}
