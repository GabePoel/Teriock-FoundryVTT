declare module "./combatant.mjs" {
  export default interface TeriockCombatant {
    _id: Readonly<ID<TeriockCombatant>>;

    get actor(): TeriockActor | null;
    get documentName(): "Combatant";
    get id(): ID<TeriockCombatant>;
    get uuid(): UUID<TeriockCombatant>;
  }
}

export {};
