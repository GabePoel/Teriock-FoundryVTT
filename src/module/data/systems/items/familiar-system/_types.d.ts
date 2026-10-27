declare module "./familiar-system.mjs" {
  export default interface FamiliarSystem {
    /** <schema> UUID of the Actor representing what this is a familiar of */
    actorUuid: UUID<TeriockActor> | null;
    /** <schema> Creature type this is a familiar of */
    creatureType: TypedIdentifier<"creature">;
  }
}

export {};
