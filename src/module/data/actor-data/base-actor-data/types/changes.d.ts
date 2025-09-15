import { TeriockAbility, TeriockEquipment } from "../../../../documents/_documents.mjs";

/** Possible values to change for some category of equipment */
type EquipmentChangeValues = {
  /** <base> Make it AV0 */
  av0: boolean | null;
  /** <base> Make it UB */
  ub: boolean | null;
  /** <base> TODO: Make if it's warded */
  warded: boolean | null;
  /** <base> Change its base damage */
  damage: string | null;
  /** <base> Change its two-handed damage */
  twoHandedDamage: string | null;
  /** <base> Change its block value */
  bv: number | null;
  /** <base> Change its armor value */
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

declare global {
  export namespace Teriock.Parameters.Actor {
    export type EquipmentChangeClassesKeys = Record<Teriock.Parameters.Equipment.EquipmentClass, Partial<EquipmentChangeValues>>;
    export type EquipmentChangeIdsKeys = Record<Teriock.ID<TeriockEquipment>, Partial<EquipmentChangeValues>>
    export type EquipmentChangeNamesKeys = Record<string, Partial<EquipmentChangeValues>>;
    export type EquipmentChangePropertiesKeys = Record<Teriock.Parameters.Equipment.PropertyKey, Partial<EquipmentChangeValues>>
    export type EquipmentChangeTypesKeys = Record<string, Partial<EquipmentChangeValues>>;

    /** Possible keys to set some category of equipment */
    export type EquipmentChangeKeys = {
      /** <base> Overrides by equipment class */
      classes: Teriock.Parameters.Actor.EquipmentChangeClassesKeys;
      /** <base> Overrides by ID */
      ids: Teriock.Parameters.Actor.EquipmentChangeIdsKeys;
      /** <base> Overrides by equipment name */
      names: Teriock.Parameters.Actor.EquipmentChangeNamesKeys;
      /** <base> Overrides by equipment property */
      properties: Teriock.Parameters.Actor.EquipmentChangePropertiesKeys;
      /** <base> Overrides by equipment type */
      types: Teriock.Parameters.Actor.EquipmentChangeTypesKeys;
    };
  }
}

/** TODO: Possible keys to set some category of ability */
type AbilityChangeKeys = {
  /** Overrides by element */
  elements: Record<Teriock.Parameters.Ability.Element, Partial<AbilityChangeValues>>;
  /** Overrides by ID */
  ids: Record<Teriock.ID<TeriockAbility>, Partial<AbilityChangeValues>>;
  /** Override by ability name */
  names: Record<string, Partial<AbilityChangeValues>>;
  /** Overrides by power source */
  powers: Record<Teriock.Parameters.Ability.PowerSource, Partial<AbilityChangeValues>>;
};

// TODO: Possibly implement more thoroughly
// noinspection JSUnusedGlobalSymbols
export interface ActorChanges {
  abilities: {
    upgrades: AbilityChangeKeys;
    overrides: AbilityChangeKeys;
  };
  equipment: {
    upgrades: Teriock.Parameters.Actor.EquipmentChangeKeys;
    overrides: Teriock.Parameters.Actor.EquipmentChangeKeys;
  };
}
