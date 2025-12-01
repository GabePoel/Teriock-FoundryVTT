import { TeriockEffect } from "../../../documents/_module.mjs";

declare module "./base-effect-model.mjs" {
  export default interface TeriockBaseEffectModel {
    /** <schema> If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** <schema> Suppression */
    suppression: {
      /** <schema> Statuses that must be active or inactive for this effect to be suppressed */
      statuses: {
        /** <schema> Statuses that suppress this if active */
        active: Set<Teriock.Parameters.Condition.ConditionKey>;
        /** <schema> Statuses that suppress this if inactive */
        inactive: Set<Teriock.Parameters.Condition.ConditionKey>;
      };
    };
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    get parent(): TeriockEffect;
  }
}
