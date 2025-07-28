import { CostsConfig } from "./rules-parts/costs";
import {
  DeliveryConfig,
  PiercingType,
} from "./rules-parts/interaction";
import { OverviewText, ResultsText } from "./rules-parts/summary";
import { ImprovementsConfig } from "./rules-parts/improvements";
import type { Duration } from "./rules-parts/duration";

/**
 * Valid ability types
 */
export type AbilityType =
  | "special"
  | "normal"
  | "gifted"
  | "echo"
  | "intrinsic"
  | "flaw";

/**
 * Data structure that the game system rules care about. (Stuff that appears directly on the wiki.)
 */
export interface TeriockAbilityRulesSchema {
  // Elder Sorcery
  elderSorcery: boolean;
  elderSorceryIncant: string;

  // Core ability properties
  powerSources: Teriock.PowerSource[];
  interaction: Teriock.Interaction;
  featSaveAttribute: Teriock.Attribute;
  maneuver: Teriock.Maneuver;
  executionTime: Teriock.ExecutionTime;
  delivery: DeliveryConfig;
  targets: Teriock.Target[];
  elements: Teriock.Element[];
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
  expansionSaveAttribute: Teriock.Attribute;

  // Costs
  costs: CostsConfig;

  // Other
  prepared: boolean;
  warded: boolean;
  secret: boolean;
}
