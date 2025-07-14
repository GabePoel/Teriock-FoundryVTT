import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";
import { TeriockFluency } from "../../../documents/_documents.mjs";

interface TeriockFluencySchema extends TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Tradecraft";
  /** Tradecarft field */
  field: string;
  /** Tradecraft */
  tradecraft: string;
  /** Parent */
  parent: TeriockFluency;
}

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockFluencySchema, TeriockBaseEffectData {}
}
