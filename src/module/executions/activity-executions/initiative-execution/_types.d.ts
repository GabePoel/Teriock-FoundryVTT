declare module "./initiative-execution.mjs" {
  export default interface InitiativeExecution {
    roller: TeriockCombatant;

    get source(): TeriockCombatant | TeriockCombatantGroup;
  }
}

export {};
