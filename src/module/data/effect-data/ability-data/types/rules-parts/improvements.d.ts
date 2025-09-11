/**
 * Valid feat save improvement amounts
 */
export type FeatSaveImprovementAmount = "proficiency" | "fluency";

/**
 * Attribute improvement configuration
 */
export interface AttributeImprovement {
  attribute: Teriock.Parameters.Actor.StatAttribute | null;
  minVal: number;
}

/**
 * Feat save improvement configuration
 */
export interface FeatSaveImprovement {
  amount: FeatSaveImprovementAmount;
  attribute: Teriock.Parameters.Actor.Attribute | null;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}
