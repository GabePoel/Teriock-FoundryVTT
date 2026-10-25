declare module "./take-automation.mjs" {
  export default interface TakeAutomation {
    command: Teriock.Keys.Command;
    morganti: boolean;
    showDialog: boolean;
    amount: number | null;
  }
}

export {};
