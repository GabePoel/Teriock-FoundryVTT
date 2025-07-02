import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import { TeriockFluency } from "../../../types/documents";

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends TeriockBaseEffectSheet {
    effect: TeriockFluency;
    document: TeriockFluency;
  }
}
