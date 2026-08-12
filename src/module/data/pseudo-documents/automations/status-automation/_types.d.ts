declare module "./status-automation.mjs" {
  export default interface StatusAutomation {
    executor: boolean;
    multi: boolean;
    target: boolean;
  }
}

export {};
