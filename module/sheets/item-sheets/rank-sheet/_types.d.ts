import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs"
import type TeriockItem from "../../../documents/item.mjs"
import type TeriockRankData from "../../../data/item-data/rank-data/rank-data.mjs"

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends TeriockBaseItemSheet {
    item: TeriockItem & { system: TeriockRankData };
    document: TeriockItem & { system: TeriockRankData };
  }
}