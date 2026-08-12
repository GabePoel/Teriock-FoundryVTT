declare module "./combatant.mjs" {
  export default interface TeriockCombatant {
    _id: ID<TeriockCombatant>;

    get actor(): AnyActor | null;

    get documentName(): "Combatant";

    get id(): ID<TeriockCombatant>;

    get uuid(): UUID<TeriockCombatant>;
  }
}

export {};
