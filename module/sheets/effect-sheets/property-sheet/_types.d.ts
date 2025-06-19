import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockPropertyData from "../../../data/effect-data/property-data/property-data.mjs";

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockPropertyData };
    document: TeriockEffect & { system: TeriockPropertyData };
  }
}
