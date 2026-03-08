declare global {
  namespace Teriock.Models {
    export type AbilityCostsPartInterface = {
      /** <schema> If this ability is adept and how much it costs if so */
      adept: CostAdjustment;
      /** <schema> Costs that must be spent for this ability to be used */
      costs: {
        break: BreakCost;
        gp: NumberCost;
        hp: NumberCost;
        material: boolean;
        materialCost: string;
        mp: NumberCost;
        somatic: boolean;
        verbal: boolean;
      };
      /** <schema> If this ability is gifted and how much it costs if so */
      gifted: CostAdjustment;
    };
  }
}

/**
 * Valid break costs
 */
export type BreakCost = "shatter" | "destroy";

/**
 * Valid cost types
 */
export type ValueCost = "none" | "static" | "formula" | "variable" | "hack";

/**
 * Numerical cost configuration.
 */
export type NumberCost = {
  type: ValueCost;
  value: {
    static: number;
    formula: Teriock.System.FormulaString;
    variable: string;
  };
};

/**
 * Const adjustment.
 */
export type CostAdjustment = {
  /** <schema> If the MP cost is changed */
  enabled: boolean;
  /** <schema> Mow much the MP cost is changed */
  amount: number;
};
