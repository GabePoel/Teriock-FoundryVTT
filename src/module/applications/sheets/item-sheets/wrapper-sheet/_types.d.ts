import TeriockBaseItemSheet from "../base-item-sheet.mjs";

declare module "./wrapper-sheet.mjs" {
  export default interface TeriockWrapperSheet extends TeriockBaseItemSheet {
    get document(): TeriockWrapper;
    get item(): TeriockWrapper;
  }
}
