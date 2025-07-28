/**
 * Valid feat save improvement amounts
 */
export type FeatSaveImprovementAmount = "proficiency" | "fluency";

/**
 * Attribute improvement configuration
 */
export interface AttributeImprovement {
  attribute: Teriock.StatAttribute | null;
  minVal: number;
}

/**
 * Feat save improvement configuration
 */
export interface FeatSaveImprovement {
  attribute: Teriock.Attribute | null;
  amount: FeatSaveImprovementAmount;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}
