declare module "./reposition-automation.mjs" {
  export default interface RepositionAutomation {
    origin: "chosen" | "executor" | "random" | "target";
    distance: Teriock.System.FormulaString;
    originBarrier: boolean;
    movementAction: string;
  }
}

export {};
