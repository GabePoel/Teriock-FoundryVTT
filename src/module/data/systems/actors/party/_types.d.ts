declare module "./party-system.mjs" {
  export default interface PartySystem {
    /** <schema> Members of the party */
    members: Set<TeriockActor>;
  }
}

export {};
