/**
 * Document mixin to support using this document.
 * @param {typeof TeriockDocument} Base
 */
export default function UsableDocumentMixin(Base) {
  return (
    /**
     * @extends {BaseDocument}
     * @mixin
     */
    class UsableDocument extends Base {
      /**
       * Does whatever the default roll/execution for this document is.
       * @param {Teriock.Interaction.UseOptions} _options
       * @returns {Promise<void>}
       * @abstract
       */
      async use(_options = {}) {}
    }
  );
}
