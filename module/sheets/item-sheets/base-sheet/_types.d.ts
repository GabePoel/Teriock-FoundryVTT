import type TeriockItem from "../../../documents/item.mjs";
import type { ItemSheet } from "@client/applications/sheets/_module.mjs";
import type { TeriockSheet } from "../../mixins/_types";

declare module "./base-sheet.mjs" {
  export default interface TeriockBaseItemSheet extends TeriockSheet, ItemSheet {
    item: TeriockItem;
    document: TeriockItem;
  }
}