import { mergeMetadata } from "../../../../utils/_module.mjs";
import TimeUnitModel from "../normal-unit-models/time-unit-model.mjs";

export default class EffectDurationUnitModel extends TimeUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { formula: true, unlimited: true });
}
