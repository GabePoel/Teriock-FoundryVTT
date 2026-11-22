declare module "./suppression-model.mjs" {
  export default interface SuppressionModel {
    /** <schema> Effect types to suppress */
    effectTypes: Set<Teriock.Keys.Effect>;
    /** <schema> Elements to suppress */
    elements: Set<Teriock.Keys.Element>;
    /** <schema> Species families to suppress */
    families: Set<Teriock.Keys.Family>;
    /** <schema> Identifiers of children to suppress */
    identifiers: Set<Identifier>;
    /** <schema> Kinds to suppress */
    kinds: Set<string>;
    /** <schema> Power sources to suppress */
    powerSources: Set<Teriock.Keys.Source>;
    /** <schema> Qualifier formula for other children to suppress */
    qualifier: Teriock.System.FormulaString;
    /** <schema> Species traits to suppress */
    traits: Set<Teriock.Keys.Trait>;
    /** <schema> Undead levels to suppress */
    undeadLevels: Set<Teriock.Keys.UndeadLevel>;
  }
}

export {};
