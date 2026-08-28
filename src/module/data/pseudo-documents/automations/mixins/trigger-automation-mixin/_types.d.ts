declare global {
  namespace Teriock.Automations {
    export interface TriggerAutomationData {
      trigger: string | null;
      triggerQualifier: Teriock.System.FormulaString;
    }
  }
}

export {};
