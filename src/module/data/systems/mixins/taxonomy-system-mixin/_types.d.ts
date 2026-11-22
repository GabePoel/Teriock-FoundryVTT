declare global {
  namespace Teriock.Models {
    export interface TaxonomySystemData {
      /** <schema> Families */
      families: Set<Teriock.Keys.Family>;
      /** <schema> Traits */
      traits: Set<Teriock.Keys.Trait>;
      /** <schema> Undead level */
      undeadLevel: Teriock.Keys.UndeadLevel;
    }
  }
}

export {};
