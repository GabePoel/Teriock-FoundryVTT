import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./resource-sheet.mjs" {
  export default interface TeriockResourceSheet extends BaseEffectSheet {
    get document(): TeriockResource;
  }
}
