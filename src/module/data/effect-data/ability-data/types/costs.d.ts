/**
 * Valid break costs
 */
export type BreakCost = "shatter" | "destroy";

/**
 * Valid cost types
 */
export type CostType = "none" | "static" | "formula" | "variable" | "hack";

/**
 * Numerical cost configuration.
 */
export interface NumberCost {
  type: CostType;
  value: {
    static: number;
    formula: string;
    variable: string;
  };
}

/**
 * Complete costs configuration.
 */
export interface CostsConfig {
  break: BreakCost;
  gp: NumberCost;
  hp: NumberCost;
  material: boolean;
  materialCost: string;
  mp: NumberCost;
  somatic: boolean;
  verbal: boolean;
}

/**
 * Const adjustment.
 */
export type CostAdjustment = {
  /** <schema> If the MP cost is changed */
  enabled: boolean;
  /** <schema> Mow much the MP cost is changed */
  amount: number;
};
