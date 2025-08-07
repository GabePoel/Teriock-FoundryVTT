import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockCondition } from "../../../documents/_documents.mjs";
import { CombatExpirationMethod } from "../shared/shared-fields";

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData extends TeriockBaseEffectData {
    /** Parent */
    parent: TeriockCondition;
    /** Expirations */
    expirations: {
      combat: { what: CombatExpirationMethod };
      description?: string;
    };
  }
}
