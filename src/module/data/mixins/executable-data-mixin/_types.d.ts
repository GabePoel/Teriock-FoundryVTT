import { TeriockMacro } from "../../../documents/_module.mjs";

export interface ExecutableDataMixinInterface {
  /** <schema> Macros that run upon usage */
  macros: Set<Teriock.UUID<TeriockMacro>>;

  /**
   * Unlink a macro.
   * @param {Teriock.UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  unlinkMacro(uuid: Teriock.UUID<TeriockMacro>): Promise<void>;
}
