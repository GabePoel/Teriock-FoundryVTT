import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import { TeriockFluency } from "../../../documents/_documents.mjs";
import { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";

declare module "./fluency-model.mjs" {
  export default interface TeriockFluencyModel
    extends TeriockBaseEffectModel,
      ExecutableDataMixinInterface {
    /** <schema> Tradecraft field */
    field: Teriock.Parameters.Fluency.Field;
    /** <schema> Tradecraft */
    tradecraft: Teriock.Parameters.Fluency.Tradecraft;

    get parent(): TeriockFluency;
  }
}
