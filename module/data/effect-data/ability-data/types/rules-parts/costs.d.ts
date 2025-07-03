/**
 * Valid break costs
 */
export type BreakCost = "shatter" | "destroy";

/**
 * Valid cost types
 */
export type CostType = "none" | "static" | "formula" | "variable" | "hack";

/**
 * Cost configuration for MP
 */
export interface MPCost {
  type: CostType;
  value: {
    static: number;
    formula: string;
    variable: string;
  };
}

/**
 * Cost configuration for HP
 */
export interface HPCost {
  type: CostType;
  value: {
    static: number;
    formula: string;
    variable: string;
  };
}

/**
 * Complete costs configuration
 */
export interface CostsConfig {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  mp: MPCost;
  hp: HPCost;
  break: BreakCost;
  materialCost: string;
}
