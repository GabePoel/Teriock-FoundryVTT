/** Protection Data */
export type ProtectionData = {
  /** Abilities */
  abilities: Set<string>;
  /** Damage Types */
  damageTypes: Set<string>;
  /** Drain Types */
  drainTypes: Set<string>;
  /** Effects */
  effects: Set<Teriock.Parameters.Ability.EffectTag>;
  /** Elements */
  elements: Set<Teriock.Parameters.Ability.Element>;
  /** Other */
  other: Set<string>;
  /** Power Sources */
  powerSources: Set<Teriock.Parameters.Ability.PowerSource>;
  /** Statuses */
  statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
};

/**
 * Protection Data Key
 */
export type ProtectionDataKey = keyof ProtectionData;

/**
 * Protection Data Value
 */
export type ProtectionDataValue =
  | Teriock.Parameters.Ability.EffectTag
  | Teriock.Parameters.Ability.Element
  | Teriock.Parameters.Ability.PowerSource
  | Teriock.Parameters.Condition.ConditionKey
  | string;
