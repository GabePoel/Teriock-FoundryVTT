import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockResource } from "../../../documents/_documents.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceModel extends TeriockBaseEffectModel {
    /** <schema> Is the resource consumable? */
    consumable: true;
    /** <schema> Max Quantity (if consumable) */
    maxQuantity: {
      /** <schema> Raw Max Quantity Value */
      raw: string;
      /** <derived> Derived Max Quantity Value */
      derived: number;
    };
    /** <schema> Quantity (if consumable) */
    quantity: number;

    get parent(): TeriockResource;
  }
}
