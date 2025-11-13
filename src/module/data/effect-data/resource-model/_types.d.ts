import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import { TeriockResource } from "../../../documents/_documents.mjs";
import { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";
import { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";

declare module "./resource-model.mjs" {
  export default interface TeriockResourceModel
    extends TeriockBaseEffectModel,
      ConsumableDataMixinInterface,
      ExecutableDataMixinInterface {
    get parent(): TeriockResource;
  }
}
