import { RegionBehaviorData } from "@common/documents/_types.mjs";

import { EffectDurationUnitModel } from "../../../models/unit-models/special-unit-models/_module.mjs";

declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    applyDocuments: boolean;
    behaviors: Partial<RegionBehaviorData>[];
    deleteOnTurnChange: boolean;
    duration: EffectDurationUnitModel;
    visibility: number;
  }
}

export {};
