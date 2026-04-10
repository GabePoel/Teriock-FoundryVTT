declare global {
  namespace Teriock.Models {
    export type PropertySystemData = {
      /** <schema> Applies even if the parent {@link TeriockEquipment} is dampened */
      applyIfDampened: boolean;
      /** <schema> Applies even if the parent {@link TeriockEquipment} is shattered */
      applyIfShattered: boolean;
      /** <schema> Applies even if the parent {@link TeriockEquipment} is unequipped */
      applyIfUnequipped: boolean;
      /** <schema> Damage type */
      damageType: Identifier;
      /** <schema> Extra damage dealt by the parent {@link TeriockEquipment} */
      extraDamage: Teriock.System.FormulaString;
      /** <schema> Power sources */
      powerSources: Teriock.Keys.PowerSource[];

      get parent(): TeriockProperty;
    };
  }
}

export {};
