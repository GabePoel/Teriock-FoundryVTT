import { TeriockMacro } from "../../../../documents/_module.mjs";

declare module "./macro-activation.mjs" {
  export default interface MacroActivation {
    primaryMacro: UUID<TeriockMacro>;
    secondaryMacro: UUID<TeriockMacro>;
    scope: object;
  }
}

export {};
