import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceData extends TeriockBaseEffectData {
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
