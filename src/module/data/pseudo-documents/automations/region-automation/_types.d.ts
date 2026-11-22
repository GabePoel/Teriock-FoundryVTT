import { RegionBehaviorData } from "@common/documents/_types.mjs";

declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    applyDocuments: boolean;
    behaviors: Partial<RegionBehaviorData>[];
    deleteOnTurnChange: boolean;
    visibility: number;
  }
}

export {};
