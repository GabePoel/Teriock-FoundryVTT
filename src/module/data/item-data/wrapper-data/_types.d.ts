import type TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockWrapper } from "../../../documents/_documents.mjs";

declare module "./wrapper-data.mjs" {
  export default interface TeriockWrapperData extends TeriockBaseItemData {
    /** Parent */
    get parent(): TeriockWrapper;
  }
}
