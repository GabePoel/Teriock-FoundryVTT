/** Protection Data */
export interface ProtectionData {
  /** Damage Types */
  damageTypes: Set<string>;
  /** Drain Types */
  drainTypes: Set<string>;
  /** Statuses */
  statuses: Set<Teriock.Parameters.Condition.Key>;
  /** Elements */
  elements: Set<Teriock.Parameters.Ability.Element>;
  /** Effects */
  effects: Set<Teriock.Parameters.Ability.EffectTag>;
  /** Power Sources */
  powerSources: Set<Teriock.Parameters.Ability.PowerSource>;
  /** Abilities */
  abilities: Set<string>;
  /** Other */
  other: Set<string>;
}
