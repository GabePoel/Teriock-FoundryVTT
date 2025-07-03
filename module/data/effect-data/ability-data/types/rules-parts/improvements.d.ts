import { FeatSaveAttribute } from "./interaction";

/**
 * Valid attributes with values that can be adjusted by abilities
 */
export type ImprovementAttribute = "int" | "mov" | "per" | "snk" | "str";

/**
 * Valid feat save improvement amounts
 */
export type FeatSaveImprovementAmount = "proficiency" | "fluency";

/**
 * Attribute improvement configuration
 */
export interface AttributeImprovement {
  attribute: ImprovementAttribute | null;
  minVal: number;
}

/**
 * Feat save improvement configuration
 */
export interface FeatSaveImprovement {
  attribute: FeatSaveAttribute | null;
  amount: FeatSaveImprovementAmount;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}
