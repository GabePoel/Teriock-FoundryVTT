import { EvaluationModel } from "../../../abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ConsumableSystemData = {
      /** <schema> Whether this document is consumable */
      consumable: boolean;
      /** <schema> The amount of the document to consumer per use */
      consumptionAmount: number;
      /** <schema> Maximum quantity configuration */
      maxQuantity: EvaluationModel;
      /** <schema> Current quantity of the document */
      quantity: number;
    };
  }
}
