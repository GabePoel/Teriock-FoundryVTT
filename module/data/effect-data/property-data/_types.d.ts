import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockProperty } from "../../../types/documents";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockBaseEffectData {
    parent: TeriockProperty;
    wikiNamespace: string;
    propertyType: string;
    damageType: string;
  }
}
