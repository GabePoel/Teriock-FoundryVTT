import { TeriockItem } from "../../../documents/_module.mjs";
import { ChildDataMixin } from "../../mixins/_types";
import type TeriockEffect from "../../../documents/effect.mjs";

export interface TeriockBaseItemSchema extends ChildDataMixin {
  /** Parent item */
  parent: TeriockItem;
  /** Update counter - used to force an update when adding/removing effects */
  updateCounter: boolean;
  /** IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
  onUse: Set<Teriock.ID<TeriockEffect>>;
}

declare module "./base-item-data.mjs" {
  /** Redundant extension is needed for intellisense. */
  export default interface TeriockBaseItemData
    extends TeriockBaseItemSchema,
      ChildDataMixin {}
}
