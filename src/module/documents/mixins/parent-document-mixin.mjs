/**
 * @import { TeriockActiveEffect } from "../_module.mjs";
 */

/**
 * Mixin for common functions used across document classes that embed children.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ParentDocument>}
 */
export default function ParentDocumentMixin(Base) {
  /**
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
     * Gets the list of active effect documents associated with this document.
     * Helper method for prepareDerivedData() that can be called explicitly.
     * @returns {TeriockActiveEffect[]}
     */
    get validEffects() {
      return [];
    }
  }

  return ParentDocument;
}
