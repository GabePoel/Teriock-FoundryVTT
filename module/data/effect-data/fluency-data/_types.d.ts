import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockFluency } from "../../../types/documents";

declare module "./fluency-data.mjs" {
  export default interface TeriockFluencyData extends TeriockBaseEffectData {
    parent: TeriockFluency;
    wikiNamespace: string;
    field: string;
    tradecraft: string;
  }
}
