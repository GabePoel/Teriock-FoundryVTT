import { TeriockTokenDocument } from "../../../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    type ConditionInformation = {
      locked: boolean;
      reasons: Set<string>;
      trackers: Set<SafeUUID<TeriockTokenDocument>>;
    };

    export type ActorConditionsPartData = {
      /** <base> Information explaining conditions in place. */
      conditionInformation: Record<Teriock.Keys.Condition, ConditionInformation>;
    };
  }
}

export {};
