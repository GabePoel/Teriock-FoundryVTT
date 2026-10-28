declare module "./summon-automation.mjs" {
  export default interface SummonAutomation {
    addToCombat: boolean;
    addToGroup: CombatantGroupType | null;
  }
}

export {};
