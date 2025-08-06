import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockMechanic } from "../../../documents/_documents.mjs";

export interface TeriockMechanicSchema extends TeriockBaseItemData {
  /** Parent */
  parent: TeriockMechanic;
}

declare module "./mechanic-data.mjs" {
  export default interface TeriockMechanicData extends TeriockMechanicSchema {}
}
