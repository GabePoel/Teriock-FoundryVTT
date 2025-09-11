import type { TeriockMechanic } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./mechanic-sheet.mjs" {
  export default interface TeriockMechanicSheet extends TeriockBaseItemSheet {
    get document(): TeriockMechanic;

    get item(): TeriockMechanic;
  }
}
