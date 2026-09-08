declare module "./base-automation.mjs" {
  export default interface BaseAutomation {
    type: AutomationType;
    _id: ID<BaseAutomation>;
    interactInExecution: boolean;
    passive: boolean;
    useInExecution: boolean;
  }
}

export {};
