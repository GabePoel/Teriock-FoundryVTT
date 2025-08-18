import type { equipmentclasses } from "../../../constants/generated/equipment-classes.mjs";
import type { weaponclasses } from "../../../constants/generated/weapon-classes.mjs";
import type { weaponFightingStyles } from "../../../constants/generated/weapon-fighting-styles.mjs";
import type { properties } from "../../../constants/generated/properties.mjs";
import type { materialProperties } from "../../../constants/generated/material-properties.mjs";
import type { magicalProperties } from "../../../constants/generated/magical-properties.mjs";

declare global {
  namespace Teriock.Parameters.Equipment {
    /** Equipment classes */
    export type EquipmentClass = keyof typeof equipmentclasses;

    /** Weapon classes */
    export type WeaponClass = keyof typeof weaponclasses;

    /** Weapon fighting styles */
    export type WeaponFightingStyle = keyof typeof weaponFightingStyles;

    /** Generic property keys */
    export type GenericPropertyKey = keyof typeof properties;

    /** Material property keys */
    export type MaterialPropertyKey = keyof typeof materialProperties;

    /** Magical property keys */
    export type MagicalPropertyKey = keyof typeof magicalProperties;

    /** Property keys */
    export type PropertyKey =
      | GenericPropertyKey
      | MaterialPropertyKey
      | MagicalPropertyKey;
  }
}
