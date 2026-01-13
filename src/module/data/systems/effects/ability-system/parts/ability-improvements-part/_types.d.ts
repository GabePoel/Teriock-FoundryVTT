export default interface AbilityImprovementsPartInterface {
  /**
   * <schema> Attributes that this ability improves
   * (not to be confused with {@link Teriock.Models.AbilityGeneralPartInterface.improvement})
   */
  improvements: ImprovementsConfig;
}

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
  text: string;
}

/**
 * Feat save improvement configuration
 */
export interface FeatSaveImprovement {
  amount: FeatSaveImprovementAmount;
  attribute: Teriock.Parameters.Actor.Attribute | null;
  text: string;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}
