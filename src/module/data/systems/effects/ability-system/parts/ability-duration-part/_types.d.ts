import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AbilityDurationPartInterface = {
      /** <schema> Time and circumstances in which this ability is active */
      duration: DurationModel;
    };
  }
}

export {};
