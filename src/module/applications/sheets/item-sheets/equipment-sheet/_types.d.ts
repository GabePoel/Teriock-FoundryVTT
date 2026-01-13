import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./equipment-sheet.mjs" {
  export default interface TeriockEquipmentSheet extends BaseItemSheet {
    get document(): TeriockEquipment;
    get item(): TeriockEquipment;
  }
}
