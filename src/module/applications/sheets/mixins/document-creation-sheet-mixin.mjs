import { getSystemClass } from "../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function DocumentCreationSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class DocumentCreationSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { createChild: this._onCreateChild } };

    /**
     * Create a child from the add button's `data-types` with its `data-type` selected by default.
     * @this {DocumentCreationSheet}
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async _onCreateChild(_event, target) {
      const types = /** @type {Teriock.Documents.ChildType[]} */ target.dataset.types.split(",");
      const type = /** @type {Teriock.Documents.ChildType} */ target.dataset.type || types[0];
      await foundry.utils.getDocumentClass(getSystemClass(type).metadata.documentName).createDialog({ type }, {
        interactive: true,
        parent: this.document,
      }, { types });
    }
  }

  return DocumentCreationSheet;
}
