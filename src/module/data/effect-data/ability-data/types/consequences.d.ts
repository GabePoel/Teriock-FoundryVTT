import type TeriockMacro from "../../../../documents/macro.mjs";
import type {
  CombatExpirationMethod, CombatExpirationSourceType, CombatExpirationTiming,
} from "../../shared/shared-fields";
import type { TeriockConsequence } from "../../../../documents/_documents.mjs";

export type EffectChangeData = {
  /** The attribute path in the {@link TeriockActor} or {@link TeriockItem} data which the change modifies */
  key: string;
  /** The value of the change effect */
  value: string;
  /** The modification mode with which the change is applied */
  mode: number;
  /** The priority level with which this change is applied */
  priority: number;
};

/**
 * Ability-specific expiration data.
 */
type AbilityExpiration = {
  combat: {
    who: {
      type: CombatExpirationSourceType
    };
    what: CombatExpirationMethod;
    when: CombatExpirationTiming;
  };
};

/**
 * Applies data for different proficiency levels
 */
export interface AbilityConsequence {
  changes: EffectChangeData[];
  checks: Set<Teriock.Parameters.Fluency.Tradecraft>;
  common: Set<Teriock.Parameters.Consequence.CommonConsequenceKey>;
  duration: number;
  endStatuses: Set<Teriock.Parameters.Condition.ConditionKey>;
  expiration: {
    normal: AbilityExpiration;
    crit: AbilityExpiration;
    changeOnCrit: boolean;
    doesExpire: boolean;
  };
  hacks: Set<Teriock.Parameters.Actor.HackableBodyPart>;
  rolls: Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>;
  startStatuses: Set<Teriock.Parameters.Condition.ConditionKey>;
  statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
}

/**
 * Consequences that are applied to the target.
 */
export interface TeriockAbilityConsequenceSchema {
  applies: {
    base: AbilityConsequence;
    proficient: AbilityConsequence;
    fluent: AbilityConsequence;
    heightened: AbilityConsequence;
    macros: Record<Teriock.SafeUUID<TeriockMacro>, Teriock.Parameters.Shared.PseudoHook>;
  };
  sustaining: Set<Teriock.UUID<TeriockConsequence>>;
}
