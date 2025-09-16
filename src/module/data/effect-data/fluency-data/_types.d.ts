import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockFluency } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyModel extends TeriockBaseEffectModel, ExecutableDataMixinInterface {
    /** <schema> Tradecraft field */
    field: Teriock.Parameters.Fluency.Field;
    /** <schema> Tradecraft */
    tradecraft: Teriock.Parameters.Fluency.Tradecraft;

    get parent(): TeriockFluency;
  }
}
