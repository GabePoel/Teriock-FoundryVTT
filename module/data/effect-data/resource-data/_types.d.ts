import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceData extends TeriockBaseEffectData {
    consumable: boolean;
    quantity: number;
    maxQuantityRaw: string;
    maxQuantity: number;
    rollFormula: string;
    functionHook: string;
  }
}
