import type { TeriockEffect } from "../../../documents/_module.mjs";
import type { HierarchyField } from "../shared/shared-fields";
import { ChildTypeModel } from "../../models/_module.mjs";

declare module "./base-effect-data.mjs" {
  // @ts-ignore
  export default interface TeriockBaseEffectData extends ChildTypeModel {
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** Suppression */
    suppression: {
      statuses: {
        active: Set<Teriock.Parameters.Condition.ConditionKey>;
        inactive: Set<Teriock.Parameters.Condition.ConditionKey>;
      };
      // Deprecated?
      comparisons: {
        actor: Teriock.Parameters.Shared.Comparator[];
        item: Teriock.Parameters.Shared.Comparator[];
      };
    };
    hierarchy: Partial<HierarchyField>;

    /** Parent effect */
    get parent(): TeriockEffect;
  }
}
