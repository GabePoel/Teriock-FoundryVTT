import { makeIconClass } from "../../../utils/_module.mjs";
import * as updaters from "../../dialogs/updaters/_module.mjs";

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
     * Open the updater named by `data-updater` for this document. This is a little hacky, but it's simple and it works.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this {FieldsSheet}
     */
    static async #onOpenUpdater(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      await updaters[target.dataset.updater]?.create({ document: this.document });
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
      await updaters.BaseUpdater.create({
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
      actions: { openUpdater: this.#onOpenUpdater, updatePaths: this.#onUpdatePaths, updateUnit: this.#onUpdateUnit },
    };
  }

  return FieldsSheet;
}
