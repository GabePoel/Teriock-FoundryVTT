import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockResource } from "../../../documents/_documents.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceData extends TeriockBaseEffectData {
    /** Parent */
    parent: TeriockResource;
    /** Is the resource consumable? */
    consumable: true;
    /** Quantity (if consumable) */
    quantity: number;
    /** Max Quantity (if consumable) */
    maxQuantity: {
      /** Raw Max Quantity Value */
      raw: string;
      /** Derived Max Quantity Value */
      derived: number;
    };
    /** Roll Formula */
    rollFormula: string;
    /** Function Hook */
    functionHook: Teriock.FunctionHook;
  }
}
