import type { TeriockEquipment } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./equipment-sheet.mjs" {
  export default interface TeriockEquipmentSheet extends TeriockBaseItemSheet {
    get item(): TeriockEquipment;

    get document(): TeriockEquipment;
  }
}
