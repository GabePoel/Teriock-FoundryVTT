import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./wrapper-sheet.mjs" {
  export default interface TeriockWrapperSheet extends BaseItemSheet {
    get document(): TeriockWrapper;
    get item(): TeriockWrapper;
  }
}
