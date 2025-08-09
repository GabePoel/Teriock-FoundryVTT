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
  attribute: Teriock.Parameters.Actor.Attribute | null;
  amount: FeatSaveImprovementAmount;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}
