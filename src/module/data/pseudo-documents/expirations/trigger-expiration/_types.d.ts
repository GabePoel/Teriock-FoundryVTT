declare module "./trigger-expiration.mjs" {
  export default interface TriggerExpiration {
    triggers: Set<Teriock.System.Trigger>;
    triggerQualifier: Teriock.System.FormulaString;
  }
}

export {};
