import { TeriockMacro } from "../../../../documents/_module.mjs";

declare module "./macro-automation.mjs" {
  export default interface MacroAutomation {
    primaryMacro: UUID<TeriockMacro> | null;
    secondaryMacro: UUID<TeriockMacro> | null;
  }
}

export {};
