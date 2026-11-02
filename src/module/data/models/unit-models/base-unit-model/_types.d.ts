declare module "./base-unit-model.mjs" {
  export default interface BaseUnitModel {
    /** <schema> Formula in the chosen unit */
    raw: Teriock.System.FormulaString;
    /** <schema> The unit to use */
    unit: string;
    /** <derived> Evaluated value in the base unit */
    value: number;
  }
}

export {};
