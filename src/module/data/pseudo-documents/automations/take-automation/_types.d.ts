declare module "./take-automation.mjs" {
  export default interface TakeAutomation {
    impact: Teriock.Keys.Impact;
    morganti: boolean;
    showDialog: boolean;
    amount: number | null;
  }
}

export {};
