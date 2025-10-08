import * as index from "../../../constants/index/_module.mjs";
import type { TeriockMacro } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Parameters.Equipment {
    /** Equipment power level */
    export type EquipmentPowerLevel =
      keyof typeof TERIOCK.options.equipment.powerLevel;
    /** Equipment classes */
    export type EquipmentClass = keyof typeof index.equipmentClasses;

    /** Weapon classes */
    export type WeaponClass = keyof typeof index.weaponClasses;

    /** Weapon fighting styles */
    export type WeaponFightingStyle = keyof typeof index.weaponFightingStyles;

    /** Material property keys */
    export type MaterialPropertyKey = keyof typeof index.materialProperties;

    /** Magical property keys */
    export type MagicalPropertyKey = keyof typeof index.magicalProperties;

    /** Property keys */
    export type PropertyKey = keyof typeof index.properties;

    /** Hooked equipment macros */
    export type HookedEquipmentMacros = Record<
      Teriock.Parameters.Shared.PropertyPseudoHook,
      Teriock.UUID<TeriockMacro>[]
    >;
  }
}
