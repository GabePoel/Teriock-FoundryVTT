import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import type { TeriockFluency } from "../../../../documents/_documents.mjs";

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends TeriockBaseEffectSheet {
    get document(): TeriockFluency;
  }
}
