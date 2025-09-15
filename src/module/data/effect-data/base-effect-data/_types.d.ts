import type { TeriockEffect } from "../../../documents/_module.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

declare module "./base-effect-data.mjs" {
  // @ts-ignore
  export default interface TeriockBaseEffectModel extends ChildTypeModel {
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
      }; // Deprecated?
      comparisons: {
        actor: Teriock.Parameters.Shared.Comparator[];
        item: Teriock.Parameters.Shared.Comparator[];
      };
    };
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    get parent(): TeriockEffect;
  }
}
