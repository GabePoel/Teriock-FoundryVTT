import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends BaseItemSheet {
    get document(): TeriockRank;
    get item(): TeriockRank;
  }
}
