import { MoneyUnitModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface PriceSystemData {
      /** <schema> Price */
      price: MoneyUnitModel;
    }
  }
}

export {};
