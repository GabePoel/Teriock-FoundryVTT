declare global {
  namespace Teriock.Models {
    export interface ConsumableSystemData {
      consumption: {
        /** <schema> The amount of the document to consume per use */
        amount: number;
        /** <schema> Whether this document is consumable */
        enabled: boolean;
      };
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
    }
  }
}

export {};
