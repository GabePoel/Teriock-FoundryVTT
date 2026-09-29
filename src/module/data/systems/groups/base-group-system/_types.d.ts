declare module "./base-group-system.mjs" {
  export default interface BaseGroupSystem {
    /** <schema> ID of the commander of the group's commander */
    commanderId: ID<TeriockCombatant> | null;

    readonly parent: TeriockCombatantGroup;
  }
}

export {};
