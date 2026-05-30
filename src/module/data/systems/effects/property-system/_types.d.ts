declare global {
  namespace Teriock.Models {
    export type PropertySystemData = {
      /** <schema> Damage type */
      damageType: TypedIdentifier<"damage">;
      /** <schema> Extra damage dealt by the parent {@link TeriockEquipment} */
      extraDamage: Teriock.System.FormulaString;
      /** <schema> Power sources */
      powerSources: Teriock.Keys.PowerSource[];

      get parent(): TeriockProperty;
    };
  }
}

export {};
