/**
 * Document mixin to support using this document.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, UsableDocument>}
 */
export default function UsableDocumentMixin(Base) {
  /**
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
