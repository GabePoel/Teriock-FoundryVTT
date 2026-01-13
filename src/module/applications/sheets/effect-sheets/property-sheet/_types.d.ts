import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends BaseEffectSheet {
    get document(): TeriockProperty;
  }
}
