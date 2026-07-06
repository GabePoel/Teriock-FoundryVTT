import { updateDialog } from "../../../../dialogs/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function FieldsCommonSheetPart(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class FieldsCommonSheetPart extends Base {
      /**
       * Increment forwards.
       * @param {PointerEvent} event
       * @param {HTMLElement} target
       * @param {number} change
       * @returns {Promise<void>}
       */
      static async #onIncrement(event, target, change = 1) {
        if (event.button === 2) { change = change * -1; }
        const { path } = target.dataset;
        // Cycle relative to the source value, since that's what the update writes to.
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
       */
      static async #onUpdatePaths(_event, target) {
        if (this.isEditable) {
          await updateDialog(
            this.document,
            target.dataset.paths.split(" ").map(p => p.trim()),
            target.dataset.title,
            target.dataset.icon,
          );
        }
      }

      /**
       * Update a unit.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async #onUpdateUnit(_event, target) {
        if (!this.isEditable) { return; }
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
