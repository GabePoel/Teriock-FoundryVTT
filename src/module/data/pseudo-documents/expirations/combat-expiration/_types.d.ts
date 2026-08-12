declare module "./combat-expiration.mjs" {
  export default interface CombatExpiration {
    event: Teriock.Keys.CombatEvent;
    relation: Teriock.Keys.CombatRelation;
    timing: Teriock.Keys.CombatTiming;
    skip: number;
  }
}

export {};
