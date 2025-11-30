import { TeriockMacro } from "../../../documents/_module.mjs";

export interface ExecutableDataMixinInterface {
  /** <schema> Macros that run upon usage */
  macros: Set<UUID<TeriockMacro>>;

  /**
   * Unlink a macro.
   * @param {UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  unlinkMacro(uuid: UUID<TeriockMacro>): Promise<void>;
}
