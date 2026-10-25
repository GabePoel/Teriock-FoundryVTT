declare module "./roll-automation.mjs" {
  export default interface RollAutomation {
    command: Teriock.Keys.Command;
    formula: Teriock.System.FormulaString;
  }
}

export {};
