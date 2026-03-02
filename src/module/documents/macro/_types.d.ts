import { TeriockMacro } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface MacroInterface {
      _id: ID<TeriockMacro>;

      get documentName(): "Macro";

      get id(): ID<TeriockMacro>;

      get uuid(): UUID<TeriockMacro>;
    }
  }
}

export {};
