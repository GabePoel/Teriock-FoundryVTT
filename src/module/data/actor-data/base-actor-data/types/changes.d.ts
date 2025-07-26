import { TeriockEquipment } from "../../../../documents/_documents.mjs";

/** Possible values to change for some category of equipment */
type EquipmentChangeValues = {
  /** Make it AV0 */
  av0: boolean | null;
  /** Make it UB */
  ub: boolean | null;
  /** Change its base damage */
  damage: string | null;
  /** Change its two-handed damage */
  twoHandedDamage: string | null;
  /** Change its block value */
  bv: number | null;
  /** Change its armor value */
  av: number | null;
};

/** Possible keys to set some category of equipment */
type EquipmentChangeKeys = {
  /** Overrides by equipment type */
  types: Record<string, Partial<EquipmentChangeValues>>;
  /** Overrides by equipment class */
  classes: Record<string, Partial<EquipmentChangeValues>>;
  /** Overrides by equipment name */
  names: Record<string, Partial<EquipmentChangeValues>>;
  /** Overrides by ID */
  ids: Record<Teriock.ID<TeriockEquipment>, Partial<EquipmentChangeValues>>;
};

export interface EquipmentChanges {
  equipmentChanges: {
    upgrades: EquipmentChangeKeys;
    overrides: EquipmentChangeKeys;
  };
}
