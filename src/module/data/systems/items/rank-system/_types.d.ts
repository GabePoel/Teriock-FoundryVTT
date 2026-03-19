declare global {
  namespace Teriock.Models {
    export type RankSystemData = {
      /** <schema> Rank Class Archetype */
      archetype: Teriock.Keys.Archetype;
      /** <schema> Rank Class Name */
      className: Teriock.Keys.Class;
      /** <schema> What number rank this is, with respect to its class */
      classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> If this rank is innage */
      innate: boolean;
      /** <schema> Max Armor Value */
      maxAv: 0 | 1 | 2 | 3 | 4;

      get parent(): TeriockRank;
    };
  }
}

export {};
