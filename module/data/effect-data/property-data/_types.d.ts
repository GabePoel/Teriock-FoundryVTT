import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockBaseEffectData {
    wikiNamespace: string;
    propertyType: string;
    damageType: string;
  }
}
