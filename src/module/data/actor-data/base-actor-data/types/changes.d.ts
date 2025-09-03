import { TeriockAbility, TeriockEquipment } from "../../../../documents/_documents.mjs";

/** Possible values to change for some category of equipment */
type EquipmentChangeValues = {
  /** Make it AV0 */
  av0: boolean | null;
  /** Make it UB */
  ub: boolean | null;
  /** TODO: Make if it's warded */
  warded: boolean | null;
  /** Change its base damage */
  damage: string | null;
  /** Change its two-handed damage */
  twoHandedDamage: string | null;
  /** Change its block value */
  bv: number | null;
  /** Change its armor value */
  av: number | null;
};

/** TODO: Possible values to change for some category of ability */
type AbilityChangeValues = {
  /** Make it AV0 */
  av0: boolean | null;
  /** Make it UB */
  ub: boolean | null;
  /** Change if it's warded */
  warded: boolean | null;
  /** Make it proficient */
  proficient: boolean | null;
  /** Make it fluent */
  fluent: boolean | null;
  /** Change its MP cost */
  mp: number | null;
  /** Change its HP cost */
  hp: number | null;
  /** Change its GP cost */
  gp: number | null;
};

/** Possible keys to set some category of equipment */
type EquipmentChangeKeys = {
  /** Overrides by equipment type */
  types: Record<string, Partial<EquipmentChangeValues>>;
  /** Overrides by equipment property */
  properties: Record<Teriock.Parameters.Equipment.PropertyKey, Partial<EquipmentChangeValues>>;
  /** Overrides by equipment class */
  classes: Record<
    Teriock.Parameters.Equipment.EquipmentClass,
    Partial<EquipmentChangeValues>
  >;
  /** Overrides by equipment name */
  names: Record<string, Partial<EquipmentChangeValues>>;
  /** Overrides by ID */
  ids: Record<Teriock.ID<TeriockEquipment>, Partial<EquipmentChangeValues>>;
};

/** Possible keys to set some category of ability */
type AbilityChangeKeys = {
  /** Overrides by element */
  elements: Record<
    Teriock.Parameters.Ability.Element,
    Partial<AbilityChangeValues>
  >;
  /** Overrides by power source */
  powers: Record<
    Teriock.Parameters.Ability.PowerSource,
    Partial<AbilityChangeValues>
  >;
  /** Override by ability name */
  names: Record<string, Partial<AbilityChangeValues>>;
  /** Overrides by ID */
  ids: Record<Teriock.ID<TeriockAbility>, Partial<AbilityChangeValues>>;
};

// TODO: Implement more thoroughly
export interface ActorChanges {
  equipment: {
    upgrades: EquipmentChangeKeys;
    overrides: EquipmentChangeKeys;
  };
  abilities: {
    upgrades: AbilityChangeKeys;
    overrides: EquipmentChangeKeys;
  };
}

export interface EquipmentChanges {
  equipmentChanges: {
    upgrades: EquipmentChangeKeys;
    overrides: EquipmentChangeKeys;
  };
}
