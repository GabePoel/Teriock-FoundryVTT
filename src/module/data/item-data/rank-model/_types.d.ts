declare module "./rank-model.mjs" {
  export default interface TeriockRankModel {
    /** <schema> Rank Class Archetype */
    archetype: Teriock.Parameters.Rank.RankArchetype;
    /** <schema> Rank Class Name */
    className: Teriock.Parameters.Rank.RankClass;
    /** <schema> What number rank this is, with respect to its class */
    classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /** <schema> Flaws */
    flaws: string;
    /** <schema> If this rank is innage */
    innate: boolean;
    /** <schema> Max Armor Value */
    maxAv: 0 | 1 | 2 | 3 | 4;

    get parent(): TeriockRank;
  }
}

export {};
