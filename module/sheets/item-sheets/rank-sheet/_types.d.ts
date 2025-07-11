import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { TeriockRank } from "../../../types/documents";
import TeriockItem from "../../../documents/item.mjs";

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends TeriockBaseItemSheet {
    item: TeriockRank & TeriockItem;
    document: TeriockRank & TeriockItem;
  }
}
