import { CostsConfig } from "./rules-parts/costs";
import { DeliveryConfig } from "./rules-parts/interaction";
import { OverviewText, ResultsText } from "./rules-parts/summary";
import { ImprovementsConfig } from "./rules-parts/improvements";
import type { Duration } from "./rules-parts/duration";

/**
 * Data structure that the game system rules care about. (Stuff that appears directly on the wiki.)
 */
export interface TeriockAbilityRulesSchema {
  /** <schema> If this is a basic ability */
  basic: boolean;
  /** <schema> What class this ability is associated with */
  class: Teriock.Parameters.Rank.RankClass;
  /** <schema> Costs that must be spent for this ability to be used */
  costs: CostsConfig;
  /** <schema> This ability's delivery */
  delivery: DeliveryConfig;
  /** <schema> Time and circumstances in which this ability is active */
  duration: Duration;
  /**
   * <schema> Tags that describe what type of effect this ability is
   * ("effect" in the Teriock rules sense, not in the Foundry VTT sense)
   */
  effects: Teriock.Parameters.Ability.EffectTag[];
  /** <schema> If this ability is considered to be Elder Sorcery */
  elderSorcery: boolean;
  /** <schema> Wording of this ability's Elder Sorcery incant */
  elderSorceryIncant: string;
  /** <schema> Elements of this ability */
  elements: Teriock.Parameters.Ability.Element[];
  /** <schema> Circumstances in which this ability's effect ends */
  endCondition: string;
  /** <schema> This ability's execution time */
  executionTime: Teriock.Parameters.Ability.ExecutionTime;
  /** <schema> This ability's expansion */
  expansion: Teriock.Parameters.Ability.Expansion | null;
  /** <schema> What is the maximum range of this ability's expansion */
  expansionRange: string | null;
  /** <schema> What attribute is used for feat saves against this ability's expansion */
  expansionSaveAttribute: Teriock.Parameters.Actor.Attribute;
  /** <schema> What attribute is used for feat saves against this ability */
  featSaveAttribute: Teriock.Parameters.Actor.Attribute;
  /** <schema> The "form" of this ability (what color it would be printed on a card) */
  form: Teriock.Parameters.Shared.Form;
  /** <schema> If this ability is gifted and how much it costs if so */
  gifted: {
    /** <schema> If this ability gifted */
    enabled: boolean;
    /** <schema> How much extra MP this ability costs if gifted */
    amount: number;
  };
  /** <schema> Description of how this ability changes if heightened */
  heightened: string;
  /**
   * <schema> Description of any improvement that makes this ability better than it would otherwise be
   * (not to be confused with {@link TeriockAbilityRulesSchema.improvements})
   */
  improvement: string;
  /**
   * <schema> Attributes that this ability improves
   * (not to be confused with {@link TeriockAbilityRulesSchema.improvement})
   */
  improvements: ImprovementsConfig;
  /** <schema> This ability's interaction */
  interaction: Teriock.Parameters.Ability.Interaction;
  /** <schema> If this ability is invoked */
  invoked: boolean;
  /** <schema> Description of any limitation that makes this ability worse than it would otherwise be */
  limitation: string;
  /** <schema> This ability's maneuver */
  maneuver: Teriock.Parameters.Ability.Maneuver;
  /** <schema> Description of what this ability does */
  overview: OverviewText;
  /** <schema> How well this ability pierces armor and equipment */
  piercing: Teriock.Parameters.Ability.Piercing;
  /** <schema> Power sources that must be available in order for this ability to work */
  powerSources: Teriock.Parameters.Ability.PowerSource[];
  /** <schema> If this ability needs to be prepared */
  prepared: boolean;
  /** <schema> The maximum range at which this ability can be used */
  range: string | null;
  /** <schema> Requirements that must be met for this ability to be used */
  requirements: string;
  /** <schema> What this ability does to a target */
  results: ResultsText;
  /** <schema> If this ability is a ritual */
  ritual: boolean;
  /** <schema> If this ability is a rotator */
  rotator: boolean;
  /** <schema> If this ability is considered "secret" */
  secret: boolean;
  /** <schema> If this ability is considered a "skill" */
  skill: boolean;
  /** <schema> If this ability is a spell */
  spell: boolean;
  /** <schema> If this ability is considered "standard" */
  standard: boolean;
  /** <schema> If this ability is sustained */
  sustained: boolean;
  /** <schema> Appropriate targets */
  targets: Teriock.Parameters.Ability.Target[];
  /** <schema> Description of this ability's trigger */
  trigger: string;
  /** <schema> If this ability is automatically warded */
  warded: boolean;
}
