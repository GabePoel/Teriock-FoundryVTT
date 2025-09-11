import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockResource } from "../../../documents/_documents.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceData extends TeriockBaseEffectData {
    /** Is the resource consumable? */
    consumable: true;
    /** Function Hook */
    functionHook: Teriock.Parameters.Resource.FunctionHook;
    /** Max Quantity (if consumable) */
    maxQuantity: {
      /** Raw Max Quantity Value */
      raw: string;
      /** Derived Max Quantity Value */
      derived: number;
    };
    /** Quantity (if consumable) */
    quantity: number;
    /** Roll Formula */
    rollFormula: string;

    get parent(): TeriockResource;
  }
}
