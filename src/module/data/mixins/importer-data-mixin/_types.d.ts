export interface ImporterDataMixinInterface {
  imports: {
    /** <schema> Specific items to import */
    items: Set<UUID<TeriockChild>>;
    /** <schema> Categories of ranks to import */
    ranks: {
      /** <schema> General archetype ranks */
      archetypes: Record<Teriock.Parameters.Rank.RankArchetype, number>;
      /** <schema> Defined class ranks */
      classes: Record<Teriock.Parameters.Rank.RankClass, number>;
      /** <schema> Ranks of any class */
      general: number;
    };
  };
}
