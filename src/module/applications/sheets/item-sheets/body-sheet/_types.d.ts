import type { TeriockBody } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./body-sheet.mjs" {
  export default interface TeriockBodySheet extends TeriockBaseItemSheet {
    get document(): TeriockBody;

    get item(): TeriockBody;
  }
}
