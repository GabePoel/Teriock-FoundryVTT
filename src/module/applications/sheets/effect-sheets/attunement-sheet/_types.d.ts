import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./attunement-sheet.mjs" {
  export default interface TeriockAttunementSheet
    extends TeriockBaseEffectSheet {
    get document(): TeriockAttunement;
  }
}
