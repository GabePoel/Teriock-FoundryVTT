import TeriockBaseItemData from "../../../data/item-data/base-item-data/base-item-data.mjs";
import TeriockItem from "../../../documents/item.mjs";
import { TeriockSheet } from "../../mixins/_types";

declare module "./base-item-sheet.mjs" {
  export default interface TeriockBaseItemSheet extends TeriockSheet {
    item: TeriockItem & {
      system: TeriockBaseItemData;
    };
    document: TeriockItem & {
      system: TeriockBaseItemData;
    };
  }
}
