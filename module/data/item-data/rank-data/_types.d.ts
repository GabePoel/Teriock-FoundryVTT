import type TeriockBaseItemData from "../base-data/base-data.mjs";
import { TeriockRank } from "../../../types/documents";

declare module "./rank-data.mjs" {
  export default interface TeriockRankData extends TeriockBaseItemData {
    parent: TeriockRank;
    wikiNamespace: string;
    description: string;
    flaws: string;
    archetype: string;
    className: string;
    classRank: number;
    hitDieSpent: boolean;
    manaDieSpent: boolean;
    hitDie: string;
    manaDie: string;
    hp: number;
    mp: number;
    maxAv: number;
  }
}
