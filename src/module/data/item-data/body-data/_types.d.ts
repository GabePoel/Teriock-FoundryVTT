import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockBody } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { WieldedDataMixinInterface } from "../../mixins/wielded-data-mixin/_types";

export default interface TeriockBodyData
  extends TeriockBaseItemModel,
    ExecutableDataMixinInterface,
    WieldedDataMixinInterface {}

declare module "./body-data.mjs" {
  export default interface TeriockBodyModel extends TeriockBodyData {
    get parent(): TeriockBody;
  }
}
