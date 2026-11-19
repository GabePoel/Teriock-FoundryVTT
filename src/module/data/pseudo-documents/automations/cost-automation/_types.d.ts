declare module "./cost-automation.mjs" {
  export default interface CostAutomation {
    costs: Record<Teriock.Keys.Stat, Teriock.System.FormulaString>;
  }
}

export {};
