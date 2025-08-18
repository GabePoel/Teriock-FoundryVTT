import type {
  TeriockEffect,
  TeriockItem,
} from "../../../documents/_module.mjs";
import type { ChildDataInterface } from "../../mixins/_types";

declare module "./base-item-data.mjs" {
  /** Redundant extension is needed for intellisense. */
  export default interface TeriockBaseItemData extends ChildDataInterface {
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
    onUse: Set<Teriock.ID<TeriockEffect>>;

    /** Parent {@link TeriockItem} */
    get parent(): typeof TeriockItem;
  }
}
