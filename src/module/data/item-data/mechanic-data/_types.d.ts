import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockMechanic } from "../../../documents/_documents.mjs";

declare module "./mechanic-data.mjs" {
  export default interface TeriockMechanicData extends TeriockBaseItemData {
    /** Parent */
    parent: TeriockMechanic;
  }
}
