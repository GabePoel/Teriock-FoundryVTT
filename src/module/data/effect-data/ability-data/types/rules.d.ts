import { CostsConfig } from "./rules-parts/costs";
import { DeliveryConfig } from "./rules-parts/interaction";
import { OverviewText, ResultsText } from "./rules-parts/summary";
import { ImprovementsConfig } from "./rules-parts/improvements";
import type { Duration } from "./rules-parts/duration";

/**
 * Data structure that the game system rules care about. (Stuff that appears directly on the wiki.)
 */
export interface TeriockAbilityRulesSchema {
  // Elder Sorcery
  elderSorcery: boolean;
  elderSorceryIncant: string;

  // Core ability properties
  powerSources: Teriock.Parameters.Ability.PowerSource[];
  interaction: Teriock.Parameters.Ability.Interaction;
  featSaveAttribute: Teriock.Parameters.Actor.Attribute;
  maneuver: Teriock.Parameters.Ability.Maneuver;
  executionTime: Teriock.Parameters.Ability.ExecutionTime;
  delivery: DeliveryConfig;
  targets: Teriock.Parameters.Ability.Target[];
  elements: Teriock.Parameters.Ability.Element[];
  duration: Duration;
  sustained: boolean;
  range: string | null;

  // Text content
  overview: OverviewText;
  results: ResultsText;
  heightened: string;
  endCondition: string;
  requirements: string;
  limitation: string;
  improvement: string;
  trigger: string;

  // Combat properties
  piercing: Teriock.Parameters.Ability.Piercing;
  improvements: ImprovementsConfig;

  // Ability types
  skill: boolean;
  spell: boolean;
  standard: boolean;
  ritual: boolean;
  class: Teriock.Parameters.Rank.RankClass;
  rotator: boolean;
  invoked: boolean;
  basic: boolean;
  form: Teriock.Parameters.Shared.Form;
  effects: Teriock.Parameters.Ability.EffectTag[];

  // Expansion
  expansion: Teriock.Parameters.Ability.Expansion | null;
  expansionRange: string | null;
  expansionSaveAttribute: Teriock.Parameters.Actor.Attribute;

  // Costs
  costs: CostsConfig;

  // Other
  prepared: boolean;
  warded: boolean;
  secret: boolean;
  gifted: {
    enabled: boolean;
    amount: number;
  };
}
