import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs";
import { TeriockRank } from "../../../types/documents";

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends TeriockBaseItemSheet {
    item: TeriockRank;
    document: TeriockRank;
  }
}
