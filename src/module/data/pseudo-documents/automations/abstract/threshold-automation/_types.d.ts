declare module "./threshold-automation.mjs" {
  export default interface ThresholdAutomation {
    circumstance: Teriock.System.FormulaString;
    threshold: Teriock.System.FormulaString | null;
  }
}

export {};
