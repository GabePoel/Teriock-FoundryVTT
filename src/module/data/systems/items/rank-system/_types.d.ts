declare global {
  namespace Teriock.Models {
    export type RankSystemData = {
      /** <schema> Rank Class Archetype */
      archetype: Teriock.Keys.Archetype;
      /** <schema> Rank Class Name */
      class: Teriock.Keys.Class;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> If this rank is innage */
      innate: boolean;
      /** <schema> Max Armor Value */
      maxAv: number;
      /** <schema> What number rank this is, with respect to its class */
      number: number;

      get parent(): TeriockRank;
    };
  }
}

export {};
