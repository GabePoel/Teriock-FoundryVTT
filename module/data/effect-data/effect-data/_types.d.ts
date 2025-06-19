import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./effect-data.mjs" {
  export default interface TeriockEffectData extends TeriockBaseEffectData {
    source: string;
  }
}
