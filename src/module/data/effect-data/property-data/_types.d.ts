import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockProperty } from "../../../documents/_documents.mjs";

interface TeriockPropertySchema extends TeriockBaseEffectData {
  /** Wiki Namespace */
  readonly wikiNamespace: "Property";
  /** Property Type */
  propertyType: Teriock.AbilityType;
  /** Damage Type */
  damageType: string;
  /** Parent */
  parent: TeriockProperty;
}

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockPropertySchema {}
}
