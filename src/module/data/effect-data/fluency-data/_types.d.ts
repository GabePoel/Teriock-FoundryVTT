import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockFluency } from "../../../documents/_documents.mjs";

interface TeriockFluencySchema extends TeriockBaseEffectData {
  /** Wiki Namespace */
  readonly wikiNamespace: "Tradecraft";
  /** Tradecraft field */
  field: Teriock.Field;
  /** Tradecraft */
  tradecraft: Teriock.Tradecraft;
  /** Parent */
  parent: TeriockFluency;
}

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockFluencySchema {}
}
