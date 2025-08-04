import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockRank } from "../../../documents/_documents.mjs";

export interface TeriockRankSchema extends TeriockBaseItemData {
  /** Wiki Namespace */
  readonly wikiNamespace: "Class";
  /** Parent */
  parent: TeriockRank;
  /** Flaws */
  flaws: string;
  /** Rank Class Archetype */
  archetype: Teriock.RankArchetype;
  /** Rank Class Name */
  className: Teriock.RankClass;
  /** What number rank this is, with respect to its class */
  classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** Is the rank's hit die spent? */
  hitDieSpent: boolean;
  /** Is the rank's mana die spent? */
  manaDieSpent: boolean;
  /** Hit Die */
  hitDie: Teriock.PolyhedralDie;
  /** Mana Die */
  manaDie: Teriock.PolyhedralDie;
  /** Hit Points (rolled from Hit Die) */
  hp: number;
  /** Mana Points (rolled from Mana Die) */
  mp: number;
  /** Max Armor Value */
  maxAv: 0 | 1 | 2 | 3 | 4;
}

declare module "./rank-data.mjs" {
  export default interface TeriockRankData extends TeriockRankSchema {}
}
