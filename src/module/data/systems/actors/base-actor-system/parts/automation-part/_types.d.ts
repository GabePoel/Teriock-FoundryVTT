import { TeriockTokenDocument } from "../../../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorAutomationPartData = {
      /** <base> Information explaining conditions in place. */
      conditionInformation: Record<
        Teriock.Keys.Condition,
        ConditionInformation
      >;
    };
  }
}
export type ConditionInformation = {
  locked: boolean;
  reasons: Set<string>;
  trackers: Set<SafeUUID<TeriockTokenDocument>>;
};

export {};
