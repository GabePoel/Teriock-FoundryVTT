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
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  mp: NumberCost;
  hp: NumberCost;
  gp: NumberCost;
  break: BreakCost;
  materialCost: string;
}
