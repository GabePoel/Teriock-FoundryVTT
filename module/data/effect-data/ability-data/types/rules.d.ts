import { AbilityManeuver, ExecutionTime } from "./rules-parts/maneuver";
import { CostsConfig } from "./rules-parts/costs";
import { Element, PowerSource } from "./rules-parts/tags";
import {
  AbilityInteraction,
  DeliveryConfig,
  FeatSaveAttribute,
  PiercingType,
  TargetType,
} from "./rules-parts/interaction";
import { OverviewText, ResultsText } from "./rules-parts/summary";
import { ImprovementsConfig } from "./rules-parts/improvements";

/**
 * Valid ability types
 */
export type AbilityType = "special" | "normal" | "gifted" | "echo" | "intrinsic" | "flaw";

/**
 * Data structure that the game system rules care about. (Stuff that appears directly on the wiki.)
 */
export interface TeriockAbilityRulesSchema {
  // Elder Sorcery
  elderSorcery: boolean;
  elderSorceryIncant: string;

  // Core ability properties
  powerSources: PowerSource[];
  interaction: AbilityInteraction;
  featSaveAttribute: FeatSaveAttribute;
  maneuver: AbilityManeuver;
  executionTime: ExecutionTime;
  delivery: DeliveryConfig;
  targets: TargetType[];
  elements: Element[];
  duration: string;
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
  piercing: PiercingType;
  improvements: ImprovementsConfig;

  // Ability types
  skill: boolean;
  spell: boolean;
  standard: boolean;
  ritual: boolean;
  class: string;
  rotator: boolean;
  invoked: boolean;
  basic: boolean;
  abilityType: AbilityType;

  // Effects and expansion
  effects: string[];
  expansion: string | null;
  expansionRange: string | null;
  expansionSaveAttribute: FeatSaveAttribute;

  // Costs
  costs: CostsConfig;

  // Other
  prepared: boolean;
  warded: boolean;
  secret: boolean;
}
