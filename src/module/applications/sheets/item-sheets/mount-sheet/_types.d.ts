import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./mount-sheet.mjs" {
  export default interface TeriockMountSheet extends BaseItemSheet {
    get document(): TeriockMount;
    get item(): TeriockMount;
  }
}
