import type {
  TeriockEffect,
  TeriockItem,
} from "../../../documents/_module.mjs";
import type { ChildTypeModelInterface } from "../../models/child-type-model/_types";

declare module "./base-item-data.mjs" {
  export default interface TeriockBaseItemModel
    extends ChildTypeModelInterface {
    /** <schema> IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
    onUse: Set<Teriock.ID<TeriockEffect>>;
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** <schema> Whether this is disabled */
    disabled: boolean;

    get parent(): TeriockItem;
  }
}
