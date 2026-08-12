declare module "./threshold-automation.mjs" {
  export default interface ThresholdAutomation {
    bonus: Teriock.System.FormulaString;
    threshold: Teriock.System.FormulaString | null;
  }
}

export {};
