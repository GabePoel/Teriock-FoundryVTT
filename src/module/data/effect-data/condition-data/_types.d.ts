import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockAttunement } from "../../../documents/_documents.mjs";
import { CombatExpirationMethod } from "../shared/shared-fields";

export interface TeriockConditionSchema extends TeriockBaseEffectData {
  /** Wiki Namespace */
  readonly wikiNamespace: "Condition";
  /** Parent */
  parent: TeriockAttunement;
  /** Expirations */
  expirations: { combat: { what: CombatExpirationMethod } };
}

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData
    extends TeriockConditionSchema {}
}
