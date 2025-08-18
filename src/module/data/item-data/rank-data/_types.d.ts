import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockRank } from "../../../documents/_documents.mjs";
import type { StatDataInterface } from "../../mixins/_types";

declare module "./rank-data.mjs" {
  export default interface TeriockRankData
    extends TeriockBaseItemData,
      StatDataInterface {
    /** Flaws */
    flaws: string;
    /** Rank Class Archetype */
    archetype: Teriock.Parameters.Rank.RankArchetype;
    /** Rank Class Name */
    className: Teriock.Parameters.Rank.RankClass;
    /** What number rank this is, with respect to its class */
    classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /** Max Armor Value */
    maxAv: 0 | 1 | 2 | 3 | 4;

    get parent(): TeriockRank;
  }
}
