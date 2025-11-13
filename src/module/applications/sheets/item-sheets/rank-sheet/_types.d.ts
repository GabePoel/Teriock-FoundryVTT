import { TeriockRank } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./rank-sheet.mjs" {
  export default interface TeriockRankSheet extends TeriockBaseItemSheet {
    get document(): TeriockRank;

    get item(): TeriockRank;
  }
}
