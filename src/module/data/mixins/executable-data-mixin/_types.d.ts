import { TeriockMacro } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ExecutableDataMixinInterface {
      /** <schema> Macros that run upon usage */
      macros: Set<UUID<TeriockMacro>>;
    }
  }
}
