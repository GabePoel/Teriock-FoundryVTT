import { TeriockWrapper } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./wrapper-sheet.mjs" {
  export default interface TeriockWrapperSheet extends TeriockBaseItemSheet {
    get document(): TeriockWrapper;

    get item(): TeriockWrapper;
  }
}
