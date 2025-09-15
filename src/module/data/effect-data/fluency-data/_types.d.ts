import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockFluency } from "../../../documents/_documents.mjs";

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyModel extends TeriockBaseEffectModel {
    /** <schema> Tradecraft field */
    field: Teriock.Parameters.Fluency.Field;
    /** <schema> Tradecraft */
    tradecraft: Teriock.Parameters.Fluency.Tradecraft;

    get parent(): TeriockFluency;
  }
}
