import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { TeriockEffect } from "../../../../documents/_module.mjs";

declare module "./wrapper-sheet.mjs" {
  export default interface TeriockWrapperSheet extends TeriockBaseItemSheet {
    get document(): TeriockWrapper<TeriockEffect>;
    get item(): TeriockWrapper<TeriockEffect>;
  }
}
