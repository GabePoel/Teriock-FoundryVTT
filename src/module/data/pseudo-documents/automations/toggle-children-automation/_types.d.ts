declare module "./toggle-children-automation.mjs" {
  export default interface ToggleChildrenAutomation {
    add: Set<TypedIdentifier>;
    remove: Set<TypedIdentifier>;
    qualifier: Teriock.System.FormulaString;
  }
}

export {};
