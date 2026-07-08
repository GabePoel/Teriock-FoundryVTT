import { makeIconClass } from "../../../../../helpers/icon.mjs";
import { ArmamentDamageUpdater, ArmamentRangeUpdater, BaseUpdater } from "../../../../dialogs/_module.mjs";

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
       * Edit armament damage formulas.
       * @returns {Promise<void>}
       */
      static async #onEditArmamentDamage() {
        if (!this.isEditable) { return; }
        await ArmamentDamageUpdater.create({ document: this.document });
      }

      /**
       * Edit armament ranges.
       * @returns {Promise<void>}
       */
      static async #onEditArmamentRange() {
        if (!this.isEditable) { return; }
        await ArmamentRangeUpdater.create({ document: this.document });
      }

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
          await BaseUpdater.create({
            document: this.document,
            paths: target.dataset.paths.split(" ").map(p => p.trim()),
            window: { icon: makeIconClass(target.dataset.icon, "title") },
          });
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
          editArmamentDamage: this.#onEditArmamentDamage,
          editArmamentRange: this.#onEditArmamentRange,
          increment: { buttons: [0, 2], handler: this.#onIncrement },
          updatePaths: this.#onUpdatePaths,
          updateUnit: this.#onUpdateUnit,
        },
      };
    }
  );
}
