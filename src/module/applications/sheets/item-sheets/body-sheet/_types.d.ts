import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./body-sheet.mjs" {
  export default interface TeriockBodySheet extends BaseItemSheet {
    get document(): TeriockBody;
    get item(): TeriockBody;
  }
}
