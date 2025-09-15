import type { TeriockEffect, TeriockItem } from "../../../documents/_module.mjs";

import type { ChildTypeModelInterface } from "../../models/child-type-model/_types";

declare module "./base-item-data.mjs" {
  // @ts-ignore
  export default interface TeriockBaseItemModel extends ChildTypeModelInterface {
    /** IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
    onUse: Set<Teriock.ID<TeriockEffect>>;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    /** Parent {@link TeriockItem} */
    get parent(): TeriockItem;
  }
}
