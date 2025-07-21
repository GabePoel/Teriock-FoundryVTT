/** Protection Data */
export interface ProtectionData {
  /** Damage Types */
  damageTypes: Set<string>;
  /** Drain Types */
  drainTypes: Set<string>;
  /** Statuses */
  statuses: Set<string>;
  /** Elements */
  elements: Set<string>;
  /** Effects */
  effects: Set<string>;
  /** Power Sources */
  powerSources: Set<string>;
  /** Abilities */
  abilities: Set<string>;
  /** Other */
  other: Set<string>;
}
