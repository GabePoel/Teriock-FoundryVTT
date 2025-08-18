import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockCondition } from "../../../documents/_documents.mjs";
import type { CombatExpirationMethod } from "../shared/shared-fields";

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData extends TeriockBaseEffectData {
    /** Expirations */
    expirations: {
      combat: { what: CombatExpirationMethod };
      description?: string;
    };

    get parent(): typeof TeriockCondition;
  }
}
