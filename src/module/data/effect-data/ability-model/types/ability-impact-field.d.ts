import {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
  TransformationConfigurationField,
} from "../../../fields/helpers/_types";
import { TeriockMacro } from "../../../../documents/_module.mjs";

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

export type AbilityExpirations = {
  /** <schema> How this effect normally expires */
  normal: AbilityExpiration;
  /** <schema> How this effect expires on a crit */
  crit: AbilityExpiration;
  /** <schema> If how this effect expires changes on a crit */
  changeOnCrit: boolean;
  /** <schema> If this effect expires */
  doesExpire: boolean;
};

export type AbilityImpactData = {
  /** <schema> Names of abilities that this can activate */
  abilityButtonNames: string[];
  /** <schema> Changes made to the parent {@link TeriockActor} */
  changes: Teriock.Foundry.EffectChangeData[];
  /** <schema> Tradecraft checks the ability can cause */
  checks: Teriock.Parameters.Fluency.Tradecraft[];
  /** <schema> Possible common impacts of using an ability */
  common: Teriock.Parameters.Consequence.CommonImpactKey[];
  /** <schema> Conditions caused by the {@link TeriockConsequence} created by this ability when it crits */
  critStatuses: Teriock.Parameters.Condition.ConditionKey[];
  /** <schema> Duration of the impact of this ability in seconds */
  duration: number;
  /** <schema> Conditions that this ability could end */
  endStatuses: Teriock.Parameters.Condition.ConditionKey[];
  /** <schema> Expiration data for the {@link TeriockConsequence} created by this ability */
  expiration: AbilityExpirations;
  /** <schema> Hacks that could be caused by this ability */
  hacks: Teriock.Parameters.Actor.HackableBodyPart[];
  /** <schema> Macro buttons */
  macroButtonUuids: UUID<TeriockMacro>;
  /** <schema> Don't place a template */
  noTemplate: boolean;
  /** <schema> Range */
  range: string;
  /** <schema> Rolls that could be caused by this ability */
  rolls: Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>;
  /** <schema> Conditions that this ability could start */
  startStatuses: Teriock.Parameters.Condition.ConditionKey[];
  /** <schema> Conditions caused by the {@link TeriockConsequence} created by this ability */
  statuses: Teriock.Parameters.Condition.ConditionKey[];
  /** <schema> Transformation configuration */
  transformation: TransformationConfigurationField;
};

/**
 * Impacts data for different proficiency levels
 */
export type AbilityImpact = ArrayToSetFor<
  AbilityImpactData,
  | "abilityButtonNames"
  | "checks"
  | "critStatuses"
  | "common"
  | "endStatuses"
  | "hacks"
  | "startStatuses"
  | "statuses"
>;

export type AbilityImpactsData = {
  base: AbilityImpactData;
  fluent: AbilityImpactData;
  heightened: AbilityImpactData;
  macros: Teriock.Parameters.Shared.MacroHookRecord;
  proficient: AbilityImpactData;
};

export type AbilityImpacts = AbilityImpactData & {
  /** <schema> Base impact of using this ability */
  base: AbilityImpact;
  /** <schema> How the impacts change if fluent in this ability */
  fluent: AbilityImpact;
  /** <schema> How the impacts change if this ability is heightened */
  heightened: AbilityImpact;
  /** <schema> {@link TeriockMacro}s hooked to the parent {@link TeriockActor} */
  macros: Teriock.Parameters.Shared.MacroHookRecord;
  /** <schema> How the impacts change if proficient in this ability */
  proficient: AbilityImpact;
};
