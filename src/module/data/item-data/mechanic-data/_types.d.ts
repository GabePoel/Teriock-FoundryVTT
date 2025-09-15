import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockMechanic } from "../../../documents/_documents.mjs";

declare module "./mechanic-data.mjs" {
  export default interface TeriockMechanicModel extends TeriockBaseItemModel {
    get parent(): TeriockMechanic;
  }
}
