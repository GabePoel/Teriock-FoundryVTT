import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockBaseItemSchema } from "../base-item-data/_types";
import { TeriockRank } from "../../../documents/_documents.mjs";

export interface TeriockRankSchema extends TeriockBaseItemSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Class";
  /** Parent */
  parent: TeriockRank;
  /** Description */
  description: string;
  /** Flaws */
  flaws: string;
  /** Rank Class Archetype */
  archetype: string;
  /** Rank Class Name */
  className: string;
  /** What number rank this is, with respect to its class */
  classRank: number;
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
  maxAv: number;
}

declare module "./rank-data.mjs" {
  export default interface TeriockRankData extends TeriockRankSchema, TeriockBaseItemData {}
}
