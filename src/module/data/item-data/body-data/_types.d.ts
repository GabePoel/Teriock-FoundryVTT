import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockBody } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";

export default interface TeriockBodyData
  extends TeriockBaseItemModel,
    ExecutableDataMixinInterface,
    ArmamentDataMixinInterface {}

declare module "./body-data.mjs" {
  export default interface TeriockBodyModel extends TeriockBodyData {
    get parent(): TeriockBody;
  }
}
