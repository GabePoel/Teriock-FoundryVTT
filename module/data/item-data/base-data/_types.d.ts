import { TeriockItem } from "@client/documents/_module.mjs";
import { ChildDataMixin } from "../../mixins/_types";

declare module "./base-data.mjs" {
  export default interface TeriockBaseItemData extends ChildDataMixin {
    /** Parent item */
    parent: TeriockItem;
    /** Force disabled */
    forceDisabled: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
  }
}
