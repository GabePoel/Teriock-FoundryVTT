import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockEffect } from "../../../documents/_module.mjs";

declare module "./wrapper-model.mjs" {
  export default interface TeriockWrapperModel extends TeriockBaseItemModel {
    get parent(): TeriockWrapper<TeriockEffect>;
  }
}
