declare module "./base-effect-system.mjs" {
  export default interface BaseEffectSystem {
    /** <schema> If this should apply even if parent is deattuned */
    applyIfDeattuned: boolean;
    /** <schema> Items this gets as dependents when added to an actor for the first time */
    dependents: {
      /** <schema> Identifiers */
      globalIdentifiers: Set<TypedIdentifier>;
      /** <schema> UUIDs */
      globalUuids: Set<UUID<TeriockItem>>;
    };

    readonly parent: TeriockActiveEffect;
  }
}

export {};
