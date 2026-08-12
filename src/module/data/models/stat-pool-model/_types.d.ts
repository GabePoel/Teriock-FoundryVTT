declare module "./stat-pool-model.mjs" {
  export default interface StatPoolModel {
    stat: Teriock.Keys.DieStat;
    disabled: boolean;
    formula: Teriock.System.FormulaString;
    spent: Set<number>;
  }
}

export {};
