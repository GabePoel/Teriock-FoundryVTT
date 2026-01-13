import { TeriockTokenDocument } from "../../../../../../documents/_module.mjs";

export default interface ActorAutomationPartInterface {
  /** <base> Information explaining conditions in place. */
  conditionInformation: ConditionInformation;
  /** <base> Registered pseudo-hook macros to fire */
  hookedMacros: Teriock.Parameters.Actor.HookedActorMacros;
}

export type ConditionInformation = Record<
  Teriock.Parameters.Condition.ConditionKey,
  {
    locked: boolean;
    reasons: Set<string>;
    trackers: Set<UUID<TeriockTokenDocument>>;
  }
>;
