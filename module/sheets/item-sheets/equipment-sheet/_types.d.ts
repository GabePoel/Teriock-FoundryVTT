import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs";
import { TeriockEquipment } from "../../../types/documents";

declare module "./equipment-sheet.mjs" {
  export default interface TeriockEquipmentSheet extends TeriockBaseItemSheet {
    item: TeriockEquipment;
    document: TeriockEquipment;
  }
}
