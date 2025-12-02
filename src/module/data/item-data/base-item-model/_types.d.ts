import { TeriockEffect, TeriockItem } from "../../../documents/_module.mjs";

declare module "./base-item-model.mjs" {
  export default interface TeriockBaseItemModel {
    /** <schema> Whether this is disabled */
    disabled: boolean;
    /** <schema> IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
    onUse: Set<ID<TeriockEffect>>;
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    get parent(): TeriockItem;
  }
}
