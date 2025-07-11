import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { TeriockPower } from "../../../types/documents";
import TeriockItem from "../../../documents/item.mjs";

declare module "./power-sheet.mjs" {
  export default interface TeriockPowerSheet extends TeriockBaseItemSheet {
    item: TeriockPower & TeriockItem;
    document: TeriockPower & TeriockItem;
  }
}
