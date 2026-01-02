import TeriockBaseItemSheet from "../base-item-sheet.mjs";

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends TeriockBaseItemSheet {
    get document(): TeriockRank;
    get item(): TeriockRank;
  }
}
