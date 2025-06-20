import { TeriockItem } from "../../../documents/_module.mjs";
import { ChildDataMixin } from "../../mixins/_types";

declare module "./base-data.mjs" {
  export default interface TeriockBaseItemData extends ChildDataMixin {
    parent: TeriockItem;
    forceDisabled: boolean;
  }
}
