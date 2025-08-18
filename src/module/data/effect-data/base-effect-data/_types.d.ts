import type { TeriockEffect } from "../../../documents/_module.mjs";
import type { HierarchyField } from "../shared/shared-fields";
import type { ChildDataInterface } from "../../shared/_types";

declare module "./base-effect-data.mjs" {
  // @ts-ignore
  export default interface TeriockBaseEffectData extends ChildDataInterface {
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** Suppression */
    suppression: {
      statuses: {
        active: Set<Teriock.Parameters.Condition.Key>;
        inactive: Set<Teriock.Parameters.Condition.Key>;
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
