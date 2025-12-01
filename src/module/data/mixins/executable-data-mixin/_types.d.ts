import { TeriockMacro } from "../../../documents/_module.mjs";

export interface ExecutableDataMixinInterface {
  /** <schema> Macros that run upon usage */
  macros: Set<UUID<TeriockMacro>>;
}
