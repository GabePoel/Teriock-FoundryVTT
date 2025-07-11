import { TeriockItem } from "@client/documents/_module.mjs";
import { ChildDataMixin } from "../../mixins/_types";

export interface TeriockBaseItemSchema extends ChildDataMixin {
  /** Parent item */
  parent: TeriockItem;
  /** Update counter - used to force an update when adding/removing effects */
  updateCounter: boolean;
}

declare module "./base-item-data.mjs" {
  /** Redundant extension is needed for intellisense. */
  export default interface TeriockBaseItemData extends TeriockBaseItemSchema, ChildDataMixin {}
}
