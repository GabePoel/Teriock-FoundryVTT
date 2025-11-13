import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockBody } from "../../../documents/_documents.mjs";
import { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";

export default interface TeriockBodyData
  extends TeriockBaseItemModel,
    ExecutableDataMixinInterface,
    ArmamentDataMixinInterface {}

declare module "./body-model.mjs" {
  export default interface TeriockBodyModel extends TeriockBodyData {
    get parent(): TeriockBody;
  }
}
