import type {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
  TransformationConfigurationField,
} from "../../../shared/fields/helpers/_types";
import type { TeriockMacro } from "../../../../documents/_module.mjs";

/**
 * Ability-specific expiration data
 */
type AbilityExpiration = {
  /** <schema> Expirations based on combat timing. */
  combat: {
    /** <schema> Who triggers effect expiration? */
    who: {
      /** <schema> What is the relationship of the {@link TeriockActor} that triggers expirations? */
      type: CombatExpirationSourceType;
    };
    /** <schema> What is the method of this expiration? */
    what: CombatExpirationMethod;
    /** <schema> When in the combat does this effect expire? */
    when: CombatExpirationTiming;
  };
};

/**
 * Applies data for different proficiency levels
 */
export interface AbilityImpact {
  /** <schema> Changes made to the parent {@link TeriockActor} */
  changes: Teriock.Foundry.EffectChangeData[];
  /** <schema> Tradecraft checks the ability can cause */
  checks: Set<Teriock.Parameters.Fluency.Tradecraft>;
  /** <schema> Possible common impacts of using an ability */
  common: Set<Teriock.Parameters.Consequence.CommonImpactKey>;
  /** <schema> Duration of the impact of this ability in seconds */
  duration: number;
  /** <schema> Conditions that this ability could end */
  endStatuses: Set<Teriock.Parameters.Condition.ConditionKey>;
  /** <schema> Expiration data for the {@link TeriockConsequence} created by this ability */
  expiration: {
    /** <schema> How this effect normally expires */
    normal: AbilityExpiration;
    /** <schema> How this effect expires on a crit */
    crit: AbilityExpiration;
    /** <schema> If how this effect expires changes on a crit */
    changeOnCrit: boolean;
    /** <schema> If this effect expires */
    doesExpire: boolean;
  };
  /** <schema> Hacks that could be caused by this ability */
  hacks: Set<Teriock.Parameters.Actor.HackableBodyPart>;
  /** <schema> Macro buttons */
  macroButtonUuids: Teriock.UUID<TeriockMacro>;
  /** <schema> Don't place a template */
  noTemplate: boolean;
  /** <schema> Range */
  range: string;
  /** <schema> Rolls that could be caused by this ability */
  rolls: Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>;
  /** <schema> Conditions that this ability could start */
  startStatuses: Set<Teriock.Parameters.Condition.ConditionKey>;
  /** <schema> Conditions caused by the {@link TeriockConsequence} created by this ability */
  statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
  /** <schema> Transformation configuration */
  transformation: TransformationConfigurationField;
}
