import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

export default interface AbilityDurationPartInterface {
  /** <schema> Time and circumstances in which this ability is active */
  duration: DurationModel;
}
