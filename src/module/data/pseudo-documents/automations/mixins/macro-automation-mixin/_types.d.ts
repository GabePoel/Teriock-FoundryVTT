import { TeriockMacro } from "../../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export interface MacroAutomationData {
      primaryMacro: UUID<TeriockMacro>;
      secondaryMacro: UUID<TeriockMacro>;
    }
  }
}

export {};
