declare module "./base-unit-model.mjs" {
  export default interface BaseUnitModel {
    raw: number | Teriock.System.FormulaString;
    unit: string;
  }
}

export {};
