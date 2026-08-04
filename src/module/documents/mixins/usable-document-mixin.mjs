/**
 * Document mixin to support using this document.
 * @template {Constructor<BaseDocument>} T
 * @param {T} Base
 */
export default function UsableDocumentMixin(Base) {
  /**
   * @extends {BaseDocument}
   * @mixin
   */
  class UsableDocument extends Base {
    /**
     * Does whatever the default roll/execution for this document is.
     * @param {Partial<Teriock.Command.UseOptions>} _options
     * @returns {Promise<void>}
     * @abstract
     */
    async use(_options = {}) {}
  }

  return UsableDocument;
}
