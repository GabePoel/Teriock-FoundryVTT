/** Protection Data */
export interface ProtectionData {
  /** Damage Types */
  damageTypes: Set<string>;
  /** Drain Types */
  drainTypes: Set<string>;
  /** Statuses */
  statuses: Set<Teriock.ConditionKey>;
  /** Elements */
  elements: Set<Teriock.Element>;
  /** Effects */
  effects: Set<Teriock.EffectTag>;
  /** Power Sources */
  powerSources: Set<Teriock.PowerSource>;
  /** Abilities */
  abilities: Set<string>;
  /** Other */
  other: Set<string>;
}
