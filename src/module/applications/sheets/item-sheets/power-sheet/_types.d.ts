import { TeriockPower } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./power-sheet.mjs" {
  export default interface TeriockPowerSheet extends TeriockBaseItemSheet {
    get document(): TeriockPower;

    get item(): TeriockPower;
  }
}
