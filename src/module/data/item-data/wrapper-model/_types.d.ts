import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockWrapper } from "../../../documents/_documents.mjs";

declare module "./wrapper-model.mjs" {
  export default interface TeriockWrapperModel extends TeriockBaseItemModel {
    get parent(): TeriockWrapper;
  }
}
