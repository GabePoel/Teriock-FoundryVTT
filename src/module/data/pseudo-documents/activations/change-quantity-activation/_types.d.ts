declare module "./change-quantity-activation.mjs" {
  export default interface ChangeQuantityActivation {
    consumable: UUID;
    formula: Teriock.System.FormulaString;
    messageMode: string | null;
    triggerLabel: string;
  }
}

export {};
