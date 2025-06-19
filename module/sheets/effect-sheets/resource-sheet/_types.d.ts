import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockResourceData from "../../../data/effect-data/resource-data/resource-data.mjs";

declare module "./resource-sheet.mjs" {
  export default interface TeriockResourceSheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockResourceData };
    document: TeriockEffect & { system: TeriockResourceData };
  }
}
