declare global {
  namespace Teriock.Models {
    export type ConsumableSystemData = {
      /** <schema> Whether this document is consumable */
      consumable: boolean;
      /** <schema> The amount of the document to consumer per use */
      consumptionAmount: number;
      /** <schema> Current quantity of the document */
      quantity: {
        /** <derived> Maximum quantity */
        max: number;
        /** <schema> Formula used to derive maximum quantity */
        maxFormula: Teriock.System.FormulaString;
        /** <derived> Minimum quantity */
        min: number;
        /** <schema> Current quantity remaining */
        value: number;
      };
    };
  }
}

export {};
