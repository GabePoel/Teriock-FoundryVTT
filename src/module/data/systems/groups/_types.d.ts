declare module "./commanded-system.mjs" {
  export default interface CommandedSystem {
    /** <schema> ID of the commander */
    commanderId: ID<TeriockCombatant> | null;
  }
}

export {};
