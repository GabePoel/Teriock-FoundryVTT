import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockBaseEffectData {
    wikiNamespace: string;
    field: string;
    tradecraft: string;
  }
}
