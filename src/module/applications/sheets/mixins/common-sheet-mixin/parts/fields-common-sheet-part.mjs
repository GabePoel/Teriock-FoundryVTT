import { updateDialog } from "../../../../dialogs/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  //noinspection JSUnresolvedReference
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockCommon} document
     */
    class FieldsCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          increment: this.#onIncrement,
          updatePaths: this.#onUpdatePaths,
          updateUnit: this.#onUpdateUnit,
        },
      };

      /**
       * Increment forwards.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async #onIncrement(_event, target) {
        await this._onIncrement(_event, target);
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
            target.dataset.paths.split(" ").map((p) => p.trim()),
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
        await foundry.utils
          .getProperty(this.document, target.dataset.path)
          .updateDialog();
      }

      /**
       * Increment forwards.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @param {number} change
       * @returns {Promise<void>}
       */
      async _onIncrement(_event, target, change = 1) {
        const { path } = target.dataset;
        const value = foundry.utils.getProperty(this.document, path);
        const schema = this.document.getSchema(path);
        const min = schema.min ?? 0;
        const max = schema.max ?? Infinity;
        const delta = max - min + 1;
        const adjusted = ((value + min + change + delta) % delta) - min;
        await this.document.update({ [path]: adjusted });
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._setupUpdateHandlers();
        this._setupChangeHandlers();
        this._setupIncrementHandlers();
      }

      /**
       * Sets up handlers for change field components.
       * Configures change inputs and remove buttons for change arrays.
       */
      _setupChangeHandlers() {
        // Change inputs
        this.element.querySelectorAll(".teriock-change-input").forEach(
          /** @param {HTMLElement} el */ (el) => {
            const { name } = el.attributes;
            if (!name?.value) return;
            el.addEventListener("change", async (e) => {
              const existing = foundry.utils.getProperty(
                this.document,
                name.value,
              );
              const copy = foundry.utils.deepClone(existing) || [];
              copy[el.dataset.index][el.dataset.part] = e.currentTarget.value;
              await this.document.update({ [name.value]: copy });
            });
          },
        );

        // Remove change buttons
        this.element.querySelectorAll(".teriock-remove-change-button").forEach(
          /** @param {HTMLButtonElement} button */ (button) => {
            const { name } = button.attributes;
            button.addEventListener("click", async () => {
              const existing = foundry.utils.getProperty(
                this.document,
                name.value,
              );
              const copy = foundry.utils.deepClone(existing) || [];
              copy.splice(button.dataset.index, 1);
              await this.document.update({ [name.value]: copy });
            });
          },
        );
      }

      /**
       * Sets up handlers for reversing increment directions.
       */
      _setupIncrementHandlers() {
        this.element.querySelectorAll("[data-action='increment']").forEach(
          /** @param {HTMLElement} el */ (el) => {
            el.addEventListener("contextmenu", async (ev) => {
              await this._onIncrement(ev, el, -1);
            });
          },
        );
      }

      /**
       * Sets up update handlers for various input types.
       * Configures change and click handlers for update inputs, select elements, and checkboxes.
       */
      _setupUpdateHandlers() {
        this.element.querySelectorAll(".teriock-update-input").forEach((el) => {
          const name = el.getAttribute("name");
          if (!name) return;
          el.addEventListener("change", async (e) => {
            const target = /** @type {HTMLFormElement} */ e.currentTarget;
            const value = target.value ?? target.getAttribute("data-value");
            await this.document.update({ [name]: value });
          });
        });
      }
    }
  );
};
