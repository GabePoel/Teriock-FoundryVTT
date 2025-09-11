import { CostsConfig } from "./rules-parts/costs";
import { DeliveryConfig } from "./rules-parts/interaction";
import { OverviewText, ResultsText } from "./rules-parts/summary";
import { ImprovementsConfig } from "./rules-parts/improvements";
import type { Duration } from "./rules-parts/duration";

/**
 * Data structure that the game system rules care about. (Stuff that appears directly on the wiki.)
 */
export interface TeriockAbilityRulesSchema {
  basic: boolean;
  class: Teriock.Parameters.Rank.RankClass;
  costs: CostsConfig;
  delivery: DeliveryConfig;
  duration: Duration;
  effects: Teriock.Parameters.Ability.EffectTag[];
  elderSorcery: boolean;
  elderSorceryIncant: string;
  elements: Teriock.Parameters.Ability.Element[];
  endCondition: string;
  executionTime: Teriock.Parameters.Ability.ExecutionTime;
  expansion: Teriock.Parameters.Ability.Expansion | null;
  expansionRange: string | null;
  expansionSaveAttribute: Teriock.Parameters.Actor.Attribute;
  featSaveAttribute: Teriock.Parameters.Actor.Attribute;
  form: Teriock.Parameters.Shared.Form;
  gifted: {
    enabled: boolean;
    amount: number;
  };
  heightened: string;
  improvement: string;
  improvements: ImprovementsConfig;
  interaction: Teriock.Parameters.Ability.Interaction;
  invoked: boolean;
  limitation: string;
  maneuver: Teriock.Parameters.Ability.Maneuver;
  overview: OverviewText;
  piercing: Teriock.Parameters.Ability.Piercing;
  powerSources: Teriock.Parameters.Ability.PowerSource[];
  prepared: boolean;
  range: string | null;
  requirements: string;
  results: ResultsText;
  ritual: boolean;
  rotator: boolean;
  secret: boolean;
  skill: boolean;
  spell: boolean;
  standard: boolean;
  sustained: boolean;
  targets: Teriock.Parameters.Ability.Target[];
  trigger: string;
  warded: boolean;
}
