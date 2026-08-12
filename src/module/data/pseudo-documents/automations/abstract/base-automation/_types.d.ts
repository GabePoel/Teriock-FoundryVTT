declare module "./base-automation.mjs" {
  export default interface BaseAutomation {
    type: Teriock.Automations.Type;
    _id: ID<BaseAutomation>;
  }
}

export {};
