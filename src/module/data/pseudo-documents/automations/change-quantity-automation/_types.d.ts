declare module "./change-quantity-automation.mjs" {
  export default interface ChangeQuantityAutomation {
    formula: Teriock.System.FormulaString;
    identifier: Identifier | TypedIdentifier;
    targetParent: boolean;
  }
}

export {};
