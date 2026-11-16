declare module "./property-system.mjs" {
  export default interface PropertySystem {
    /** <schema> Damage type */
    damageType: Slug;
    /** <schema> Extra damage dealt by the parent equipment */
    extraDamage: Teriock.System.FormulaString;
  }
}

export {};
