import type { TeriockMacro } from "../../../documents/_module.mjs";

export interface ExecutableDataMixinInterface {
  /** Macros that run upon usage */
  macros: Set<Teriock.UUID<TeriockMacro>>;
}