const { Macro } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Macro} implementation.
 * @extends {Macro}
 * @mixes ClientDocumentMixin
 * @property {"Macro"} documentName
 * @property {boolean} isOwner
 */
export default class TeriockMacro extends Macro {
  /**
   * @inheritDoc
   * @param {Teriock.RollOptions.MacroScope} scope
   */
  async execute(scope = {}) {
    await super.execute(scope);
  }
}
