declare module "./cost-automation.mjs" {
  export default interface CostAutomation {
    costs: Record<Teriock.Keys.Stat, Teriock.System.FormulaString>;
    tweaks: Record<keyof typeof TERIOCK.CONFIG.cost.tweaks, Teriock.System.FormulaString>;
  }
}

export {};
