import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockFluency } from "../../../types/documents";
import TeriockEffect from "../../../documents/effect.mjs";

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends TeriockBaseEffectSheet {
    effect: TeriockFluency & TeriockEffect;
    document: TeriockFluency & TeriockEffect;
  }
}
