/**
 * Mixin for common functions used across document classes that embed children.
 * @param {typeof BaseDocument} Base
 */
export default function ParentDocumentMixin(Base) {
  return (
    /**
     * @mixes BaseDocument
     * @mixes CommonDocument
     * @mixes PanelDocument
     * @mixin
     */
    class ParentDocument extends Base {
      /**
       * @inheritDoc
       * @returns {Teriock.Documents.DocumentMetadata}
       */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { parent: true });
      }

      /**
       * Gets the list of {@link TeriockActiveEffect} documents associated with this document.
       * Helper method for prepareDerivedData() that can be called explicitly.
       * @returns {TeriockActiveEffect[]}
       */
      get validEffects() {
        return [];
      }
    }
  );
}
