import { EffectChangeData } from "@common/documents/_types.mjs";

/**
 * Valid turn expiration targets
 */
export type TurnExpirationTarget = "target" | "executor" | "every" | "other";

/**
 * Valid turn expiration timing
 */
export type TurnExpirationTiming = "start" | "end" | "other";

/**
 * Valid turn expiration methods
 */
export type TurnExpirationMethod = "roll" | "auto";

/**
 * Consequence rolls for different effect types
 */
export interface ConsequenceRolls {
  damage: string[];
  drain: string[];
  wither: string[];
  heal: string[];
  revitalize: string[];
  setTempHp: string[];
  setTempMp: string[];
  gainTempHp: string[];
  gainTempMp: string[];
  sleep: string[];
  kill: string[];
  other: string[];
}

/**
 * Consequence expiration conditions
 */
export interface ConsequenceExpirations {
  turn: {
    enabled: boolean;
    who: TurnExpirationTarget;
    when: TurnExpirationTiming;
    how: TurnExpirationMethod;
  };
  movement: boolean;
  dawn: boolean;
  sustained: boolean;
}

/**
 * Valid interaction types for abilities
 */
export type AbilityInteraction = "attack" | "feat" | "block" | "manifest";

/**
 * Valid feat save attributes
 */
export type FeatSaveAttribute = "int" | "mov" | "per" | "snk" | "str" | "unp";

/**
 * Valid maneuvers for abilities
 */
export type AbilityManeuver = "active" | "reactive" | "passive" | "slow";

/**
 * Valid execution times for active maneuvers
 */
export type ActiveExecutionTime = "a0" | "a1" | "a2" | "a3";

/**
 * Valid execution times for reactive maneuvers
 */
export type ReactiveExecutionTime = "r0" | "r1";

/**
 * Valid execution times for passive maneuvers
 */
export type PassiveExecutionTime = "passive";

/**
 * Valid execution times for slow maneuvers
 */
export type SlowExecutionTime = "longRest" | "shortRest" | string;

/**
 * Valid execution times
 */
export type ExecutionTime = ActiveExecutionTime | ReactiveExecutionTime | PassiveExecutionTime | SlowExecutionTime;

/**
 * Valid delivery methods
 */
export type DeliveryMethod =
  | "armor"
  | "aura"
  | "bite"
  | "cone"
  | "hand"
  | "item"
  | "missile"
  | "self"
  | "sight"
  | "shield"
  | "weapon"
  | "other";

/**
 * Valid delivery packages
 */
export type DeliveryPackage = "ball" | "ray" | "ritual" | "strike" | "touch" | null;

/**
 * Valid delivery parents
 */
export type DeliveryParent = "item" | null;

/**
 * Valid elements
 */
export type Element = "life" | "storm" | "necromancy" | "flame" | "nature";

/**
 * Valid power sources
 */
export type PowerSource =
  | "alchemical"
  | "divine"
  | "financial"
  | "magical"
  | "martial"
  | "primal"
  | "psionic"
  | "spiritual"
  | "technological"
  | "unknown";

/**
 * Valid expansions
 */
export type Expansion = "cascade" | "detonate" | "fork" | "ripple" | null;

/**
 * Valid break costs
 */
export type BreakCost = "shatter" | "destroy";

/**
 * Valid feat save improvement amounts
 */
export type FeatSaveImprovementAmount = "proficiency" | "fluency";

/**
 * Valid piercing types
 */
export type PiercingType = "normal" | "av0" | "ub";

/**
 * Valid cost types
 */
export type CostType = "none" | "static" | "formula" | "variable" | "hack";

/**
 * Valid change modes for effect changes
 */
export type ChangeMode = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Valid ability types
 */
export type AbilityType = "special" | "normal" | "gifted" | "echo" | "intrinsic" | "flaw";

/**
 * Applies data for different proficiency levels
 */
export interface AppliesData {
  statuses: Set<string>;
  startStatuses: Set<string>;
  endStatuses: Set<string>;
  rolls: ConsequenceRolls;
  hacks: Set<string>;
  changes: EffectChangeData[];
}

/**
 * Delivery configuration
 */
export interface DeliveryConfig {
  base: DeliveryMethod;
  parent: DeliveryParent;
  package: DeliveryPackage;
}

/**
 * Cost configuration for MP
 */
export interface MPCost {
  type: CostType;
  value: {
    static: number;
    formula: string;
    variable: string;
  };
}

/**
 * Cost configuration for HP
 */
export interface HPCost {
  type: CostType;
  value: {
    static: number;
    formula: string;
    variable: string;
  };
}

/**
 * Complete costs configuration
 */
export interface CostsConfig {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  mp: MPCost;
  hp: HPCost;
  break: string;
  materialCost: string;
}

/**
 * Overview text for different proficiency levels
 */
export interface OverviewText {
  base: string;
  proficient: string;
  fluent: string;
}

/**
 * Results text for different outcomes
 */
export interface ResultsText {
  hit: string;
  critHit: string;
  miss: string;
  critMiss: string;
  save: string;
  critSave: string;
  fail: string;
  critFail: string;
}

/**
 * Attribute improvement configuration
 */
export interface AttributeImprovement {
  attribute: string | null;
  minVal: number;
}

/**
 * Feat save improvement configuration
 */
export interface FeatSaveImprovement {
  attribute: FeatSaveAttribute | null;
  amount: string;
}

/**
 * Improvements configuration
 */
export interface ImprovementsConfig {
  attributeImprovement: AttributeImprovement;
  featSaveImprovement: FeatSaveImprovement;
}

/**
 * Complete ability data structure
 */
export interface TeriockAbilitySchemaData {
  // Basic identification
  parentId: string | null;
  childIds: string[];

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
  targets: Target[];
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

  // Consequences and applies
  applies: {
    base: AppliesData;
    proficient: AppliesData;
    fluent: AppliesData;
  };

  // Other
  prepared: boolean;
  warded: boolean;
  secret: boolean;
}
