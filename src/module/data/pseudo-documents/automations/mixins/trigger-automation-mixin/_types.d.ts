declare global {
  namespace Teriock.Automations {
    export type TriggerAutomationData = { trigger: string | null, triggerQualifier: Teriock.System.FormulaString };
  }
}

export {};
