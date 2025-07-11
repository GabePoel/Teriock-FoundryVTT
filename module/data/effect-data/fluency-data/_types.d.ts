import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";

interface TeriockFluencySchema extends TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Tradecraft";
  /** Tradecarft field */
  field: string;
  /** Tradecraft */
  tradecraft: string;
}

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockFluencySchema, TeriockBaseEffectData {}
}
