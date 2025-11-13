declare global {
  namespace Teriock.Parameters.Rank {
    /** Archetype */
    export type RankArchetype = keyof typeof TERIOCK.options.rank;

    /** Class */
    export type RankClass = keyof typeof TERIOCK.options.ability.class;
  }
}

export {};
