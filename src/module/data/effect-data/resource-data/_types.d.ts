import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockResource } from "../../../documents/_documents.mjs";

declare module "./resource-data.mjs" {
  export default interface TeriockResourceModel extends TeriockBaseEffectModel {
    /** Is the resource consumable? */
    consumable: true;
    /** Max Quantity (if consumable) */
    maxQuantity: {
      /** Raw Max Quantity Value */
      raw: string;
      /** Derived Max Quantity Value */
      derived: number;
    };
    /** Quantity (if consumable) */
    quantity: number;

    get parent(): TeriockResource;
  }
}
