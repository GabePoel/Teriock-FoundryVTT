import { TeriockEffect, TeriockItem } from "../../../documents/_module.mjs";
import { ChildTypeModelInterface } from "../../models/child-type-model/_types";

declare module "./base-item-model.mjs" {
  export default interface TeriockBaseItemModel
    extends ChildTypeModelInterface {
    /** <schema> Whether this is disabled */
    disabled: boolean;
    /** <schema> IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
    onUse: Set<Teriock.ID<TeriockEffect>>;
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;

    get parent(): TeriockItem;
  }
}
