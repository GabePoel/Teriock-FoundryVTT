declare global {
  namespace Teriock.Models {
    export interface ConsumableSystemData {
      /** <schema> Whether this document is consumable */
      consumable: boolean;
      consumption: {
        /** <schema> The amount of the document to consume per use */
        amount: number;
        /** <schema> Stats whose costs can be paid by consuming this document */
        stats: Set<Teriock.Keys.Stat>;
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
