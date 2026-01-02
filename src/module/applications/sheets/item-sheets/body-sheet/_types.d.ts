import TeriockBaseItemSheet from "../base-item-sheet.mjs";

declare module "./body-sheet.mjs" {
  export default interface TeriockBodySheet extends TeriockBaseItemSheet {
    get document(): TeriockBody;
    get item(): TeriockBody;
  }
}
