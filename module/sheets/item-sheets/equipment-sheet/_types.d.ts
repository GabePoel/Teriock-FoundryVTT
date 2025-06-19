import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs"
import type TeriockItem from "../../../documents/item.mjs"
import type TeriockEquipmentData from "../../../data/item-data/equipment-data/equipment-data.mjs"

declare module "./equipment-sheet.mjs" {
  export default interface TeriockEquipmentSheet extends TeriockBaseItemSheet {
    item: TeriockItem & { system: TeriockEquipmentData };
    document: TeriockItem & { system: TeriockEquipmentData };
  }
}