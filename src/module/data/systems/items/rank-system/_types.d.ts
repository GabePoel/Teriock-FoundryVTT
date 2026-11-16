declare module "./rank-system.mjs" {
  export default interface RankSystem {
    /** <schema> Rank Class Archetype */
    archetype: Teriock.Keys.Archetype;
    /** <schema> Rank Class Name */
    class: Teriock.Keys.Class;
    /** <schema> Flaws */
    flaws: string;
    /** <schema> What number rank this is, with respect to its class */
    number: number;
  }
}

export {};
