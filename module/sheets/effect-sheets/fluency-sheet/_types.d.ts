import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockFluencyData from "../../../data/effect-data/fluency-data/fluency-data.mjs";

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockFluencyData };
    document: TeriockEffect & { system: TeriockFluencyData };
  }
}
