import { TeriockTokenDocument } from "../../../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorAutomationPartInterface = {
      /** <base> Information explaining conditions in place. */
      conditionInformation: Teriock.Parameters.Actor.ConditionInformation;
    };
  }

  namespace Teriock.Parameters.Actor {
    export type ConditionInformation = Record<
      Teriock.Parameters.Condition.ConditionKey,
      {
        locked: boolean;
        reasons: Set<string>;
        trackers: Set<SafeUUID<TeriockTokenDocument>>;
      }
    >;
  }
}

export {};
