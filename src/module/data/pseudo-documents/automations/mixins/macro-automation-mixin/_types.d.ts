import { TeriockMacro } from "../../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type MacroAutomationData = { primaryMacro: UUID<TeriockMacro>, secondaryMacro: UUID<TeriockMacro> };
  }
}

export {};
