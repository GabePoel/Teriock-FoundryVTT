import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockFluency } from "../../../documents/_documents.mjs";

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockBaseEffectData {
    /** Tradecraft field */
    field: Teriock.Parameters.Fluency.Field;
    /** Tradecraft */
    tradecraft: Teriock.Parameters.Fluency.Tradecraft;

    get parent(): TeriockFluency;
  }
}
