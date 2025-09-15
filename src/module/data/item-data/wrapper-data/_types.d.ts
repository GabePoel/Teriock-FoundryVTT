import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockWrapper } from "../../../documents/_documents.mjs";

declare module "./wrapper-data.mjs" {
  export default interface TeriockWrapperModel extends TeriockBaseItemModel {
    get parent(): TeriockWrapper;
  }
}
