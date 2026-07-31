import { makeIconClass } from "../../../helpers/icon.mjs";
import { BaseUpdater } from "../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {Constructor<TeriockDocumentSheet>} T
 * @param {T} Base
 */
export default function FieldsSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class FieldsSheet extends Base {
      /**
       * Increment forwards.
       * @param {PointerEvent} event
       * @param {HTMLElement} target
       * @param {number} change
       * @returns {Promise<void>}
       * @this {FieldsSheet}
       */
      static async #onIncrement(event, target, change = 1) {
        if (!game.teriock.checkEditable(this)) { return; }
        if (event.button === 2) { change = change * -1; }
        const { path } = target.dataset;
        const value = foundry.utils.getProperty(this.document._source, path)
          ?? foundry.utils.getProperty(this.document, path);
        const schema = this.document.getFieldForProperty(path);
        const min = schema?.min ?? 0;
        const max = schema?.max ?? Infinity;
        const delta = max - min + 1;
        const adjusted = ((value + min + change + delta) % delta) - min;
        await this.document.update({ [path]: adjusted });
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
        await BaseUpdater.create({
          document: this.document,
          paths: target.dataset.paths.split(" ").map(p => p.trim()),
          window: { icon: makeIconClass(target.dataset.icon, "title") },
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
        actions: {
          increment: { buttons: [0, 2], handler: this.#onIncrement },
          updatePaths: this.#onUpdatePaths,
          updateUnit: this.#onUpdateUnit,
        },
      };
    }
  );
}
