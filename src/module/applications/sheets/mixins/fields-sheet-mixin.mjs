import { makeIconClass } from "../../../utils/_module.mjs";
import { BaseUpdater, KindUpdater } from "../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function FieldsSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class FieldsSheet extends Base {
    /**
     * Edit this document's kind.
     * @returns {Promise<void>}
     * @this {FieldsSheet}
     */
    static async #onUpdateKind() {
      if (!game.teriock.checkEditable(this)) { return; }
      await KindUpdater.create({ document: this.document });
    }

    /**
     * Update several paths.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this {FieldsSheet}
     */
    static async #onUpdatePaths(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      const paths = target.dataset.paths?.split(/\s+/).filter(Boolean);
      if (!paths?.length) { return; }
      await BaseUpdater.create({
        document: this.document,
        paths,
        window: { icon: makeIconClass(target.dataset.icon, "title"), title: target.dataset.title },
      });
    }

    /**
     * Update a unit.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this {FieldsSheet}
     */
    static async #onUpdateUnit(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      await foundry.utils.getProperty(this.document, target.dataset.path).updateDialog();
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { updateKind: this.#onUpdateKind, updatePaths: this.#onUpdatePaths, updateUnit: this.#onUpdateUnit },
    };
  }

  return FieldsSheet;
}
