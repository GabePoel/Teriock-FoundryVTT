import type { TeriockEffect } from "../../../documents/_module.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

declare module "./base-effect-data.mjs" {
  // @ts-ignore
  export default interface TeriockBaseEffectModel extends ChildTypeModel {
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Suppression */
    suppression: {
      statuses: {
        active: Set<Teriock.Parameters.Condition.ConditionKey>;
        inactive: Set<Teriock.Parameters.Condition.ConditionKey>;
      }; // Deprecated?
      comparisons: {
        actor: Teriock.Parameters.Shared.Comparator[];
        item: Teriock.Parameters.Shared.Comparator[];
      };
    };
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    /** Parent effect */
    get parent(): TeriockEffect;
  }
}
