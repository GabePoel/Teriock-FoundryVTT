import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockRank } from "../../../documents/_documents.mjs";

declare module "./rank-data.mjs" {
  export default interface TeriockRankData extends TeriockBaseItemData {
    /** Parent */
    parent: TeriockRank;
    /** Flaws */
    flaws: string;
    /** Rank Class Archetype */
    archetype: Teriock.Parameters.Rank.RankArchetype;
    /** Rank Class Name */
    className: Teriock.Parameters.Rank.RankClass;
    /** What number rank this is, with respect to its class */
    classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /** Is the rank's hit die spent? */
    hitDieSpent: boolean;
    /** Is the rank's mana die spent? */
    manaDieSpent: boolean;
    /** Hit Die */
    hitDie: Teriock.RollOptions.PolyhedralDie;
    /** Mana Die */
    manaDie: Teriock.RollOptions.PolyhedralDie;
    /** Hit Points (rolled from Hit Die) */
    hp: number;
    /** Mana Points (rolled from Mana Die) */
    mp: number;
    /** Max Armor Value */
    maxAv: 0 | 1 | 2 | 3 | 4;
  }
}
