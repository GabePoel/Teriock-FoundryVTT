import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockCondition } from "../../../documents/_documents.mjs";
import type { CombatExpirationMethod } from "../shared/shared-fields";

declare module "./condition-data.mjs" {
  export default interface TeriockConditionModel extends TeriockBaseEffectModel {
    /** <schema> Expirations */
    expirations: {
      /** <schema> Combat expirations */
      combat: {
        /** <schema> Method of combat expiration */
        what: CombatExpirationMethod
      };
      /** <schema> Expiration description */
      description?: string;
    };

    get parent(): TeriockCondition;
  }
}
