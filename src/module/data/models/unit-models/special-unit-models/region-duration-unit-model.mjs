import { mergeMetadata } from "../../../../utils/_module.mjs";
import TimeUnitModel from "../normal-unit-models/time-unit-model.mjs";

export default class RegionDurationUnitModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Duration"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { unitOptions: { initial: "unlimited" }, unlimited: true });
}
