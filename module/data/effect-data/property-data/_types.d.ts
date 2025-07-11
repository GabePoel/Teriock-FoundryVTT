import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";

interface TeriockPropertySchema extends TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Property";
  /** Property Type */
  propertyType: string;
  /** Damage Type */
  damageType: string;
}

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockPropertySchema, TeriockBaseEffectData {}
}
