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
      /** <schema> Whether this rank was gained innately or learned */
      origin: Teriock.Keys.RankOrigin;

      get innate(): boolean;

      get parent(): TeriockRank;
    };
  }
}

export {};
