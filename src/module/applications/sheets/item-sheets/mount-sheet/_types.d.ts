import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./mount-sheet.mjs" {
  export default interface TeriockMountSheet extends TeriockBaseItemSheet {
    get document(): TeriockMount;

    get item(): TeriockMount;
  }
}
