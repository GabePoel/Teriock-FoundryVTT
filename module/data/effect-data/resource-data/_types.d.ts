import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockResource } from "../../../types/documents";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceData extends TeriockBaseEffectData {
    parent: TeriockResource;
    consumable: boolean;
    quantity: number;
    maxQuantity: {
      raw: string;
      derived: number;
    };
    rollFormula: string;
    functionHook: string;
  }
}
