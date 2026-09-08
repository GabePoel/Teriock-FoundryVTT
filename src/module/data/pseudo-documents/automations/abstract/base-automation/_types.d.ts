declare module "./base-automation.mjs" {
  export default interface BaseAutomation {
    type: AutomationType;
    _id: ID<BaseAutomation>;
    display: { label: string };
    interactInExecution: boolean;
    useInExecution: boolean;
  }
}

export {};
