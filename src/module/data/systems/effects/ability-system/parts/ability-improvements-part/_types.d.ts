export default interface AbilityUpgradesPartInterface {
  /** <schema> Attributes that this ability upgrades */
  upgrades: UpgradesConfig;
}

/**
 * Valid feat save improvement amounts
 */
export type FeatSaveImprovementAmount = "proficiency" | "fluency";

/**
 * Upgrades configuration
 */
export interface UpgradesConfig {
  competence: {
    attribute: Teriock.Parameters.Actor.Attribute | null;
    value: number;
  };
  score: {
    attribute: Teriock.Parameters.Actor.StatAttribute | null;
    value: number;
  };
}
