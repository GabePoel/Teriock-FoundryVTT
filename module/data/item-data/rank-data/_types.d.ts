import type TeriockBaseItemData from "../base-data/base-data.mjs";

declare module "./rank-data.mjs" {
  export default interface TeriockRankData extends TeriockBaseItemData {
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
