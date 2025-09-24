import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockResource } from "../../../documents/_documents.mjs";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceModel
    extends TeriockBaseEffectModel,
      ConsumableDataMixinInterface,
      ExecutableDataMixinInterface {
    get parent(): TeriockResource;
  }
}
