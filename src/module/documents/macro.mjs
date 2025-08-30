import { BaseTeriockMacro } from "./_base.mjs";

export default class TeriockMacro extends BaseTeriockMacro {
  /**
   * @inheritDoc
   * @param {Teriock.RollOptions.MacroScope} scope
   */
  async execute(scope = {}) {
    await super.execute(scope);
  }
}
