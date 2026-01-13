import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./fluency-sheet.mjs" {
  export default interface TeriockFluencySheet extends BaseEffectSheet {
    get document(): TeriockFluency;
  }
}
