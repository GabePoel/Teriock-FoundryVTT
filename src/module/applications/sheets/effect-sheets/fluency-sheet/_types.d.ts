import type { TeriockFluency } from "../../../../documents/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs"

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends TeriockBaseEffectSheet {
    get document(): TeriockFluency;
  }
}
