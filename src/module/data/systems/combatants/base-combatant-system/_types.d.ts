declare module "./base-combatant-system.mjs" {
  export default interface BaseCombatantSystem {
    /** <schema> Actions remaining this turn */
    actions: number;
    /** <schema> Accumulated attack penalty */
    attackPenalty: number;
    /** <schema> Reactions remaining this round */
    reactions: number;
  }
}

export {};
