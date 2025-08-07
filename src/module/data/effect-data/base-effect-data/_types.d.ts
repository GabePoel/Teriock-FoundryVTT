import TeriockEffect from "../../../documents/effect.mjs";
import { HierarchyField } from "../shared/shared-fields";
import type { ChildDataInterface } from "../../mixins/_types";

declare module "./base-effect-data.mjs" {
  /** Redundant extension is needed for intellisense. */
  export default interface TeriockBaseEffectData extends ChildDataInterface {
    /** Parent effect */
    parent: TeriockEffect;
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** Suppression */
    suppression: {
      statuses: {
        active: Set<Teriock.ConditionKey>;
        inactive: Set<Teriock.ConditionKey>;
      };
      comparisons: {
        actor: Teriock.Comparator[];
        item: Teriock.Comparator[];
      };
    };
    hierarchy: Partial<HierarchyField>;
  }
}
