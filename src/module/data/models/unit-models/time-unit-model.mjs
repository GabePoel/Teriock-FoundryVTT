import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class TimeUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    formula: true,
    icon: TERIOCK.DISPLAY.icons.manifest.ui.time,
    unitConfig: "time",
  });
}
