import { TeriockItem } from "../../../../documents/_module.mjs";

declare module "./base-item-sheet.mjs" {
  export default interface TeriockBaseItemSheet {
    get document(): TeriockItem;
    get item(): TeriockItem;
  }
}
