declare global {
  namespace Teriock.Models {
    export type RankSystemData = {
      /** <schema> Rank Class Archetype */
      archetype: TypedIdentifier<"archetype", Teriock.Keys.Archetype>;
      /** <schema> Rank Class Name */
      class: TypedIdentifier<"class", Teriock.Keys.Class>;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> Max Armor Value */
      maxAv: number;
      /** <schema> What number rank this is, with respect to its class */
      number: number;

      get innate(): boolean;

      get parent(): TeriockRank;
    };
  }
}

export {};
