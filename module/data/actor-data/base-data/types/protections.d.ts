interface ProtectionCheck {
  key: string;
  value: string | number | boolean;
}

export interface ProtectionData {
  damageTypes: Set<string>;
  drainTypes: Set<string>;
  statuses: Set<string>;
  elements: Set<string>;
  effects: Set<string>;
  powerSources: Set<string>;
  abilities: Set<string>;
  other: Set<string>;
  // combos: Set<ProtectionCheck[]>;
}
