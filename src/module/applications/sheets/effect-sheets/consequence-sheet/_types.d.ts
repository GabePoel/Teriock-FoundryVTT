import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./consequence-sheet.mjs" {
  export default interface TeriockConsequenceSheet extends BaseEffectSheet {
    get document(): TeriockConsequence;
  }
}
