declare module "./stat-pool-model.mjs" {
  export default interface StatPoolModel {
    disabled: boolean;
    formula: Teriock.System.FormulaString;
    spent: Set<number>;
  }
}

export {};
