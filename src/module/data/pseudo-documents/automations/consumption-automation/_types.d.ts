declare module "./consumption-automation.mjs" {
  export default interface ConsumptionAutomation {
    qualifier: Teriock.System.FormulaString;
    stats: Set<Teriock.Keys.Stat>;
  }
}

export {};
