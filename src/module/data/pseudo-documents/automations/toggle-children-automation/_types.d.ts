declare module "./toggle-children-automation.mjs" {
  export default interface ToggleChildrenAutomation {
    add: Set<Identifier>;
    remove: Set<Identifier>;
    qualifier: Teriock.System.FormulaString;
  }
}

export {};
