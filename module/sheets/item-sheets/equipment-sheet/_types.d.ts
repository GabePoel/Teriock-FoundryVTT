import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { TeriockEquipment } from "../../../types/documents";
import TeriockItem from "../../../documents/item.mjs";

declare module "./equipment-sheet.mjs" {
  export default interface TeriockEquipmentSheet extends TeriockBaseItemSheet {
    item: TeriockEquipment & TeriockItem;
    document: TeriockEquipment & TeriockItem;
  }
}
