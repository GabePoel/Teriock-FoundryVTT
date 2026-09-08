declare global {
  namespace Teriock.PseudoDocuments {
    export interface TriggerMechanicData {
      triggerQualifier: Teriock.System.FormulaString;
      triggers: Set<Teriock.System.Trigger>;
    }
  }
}

export {};
