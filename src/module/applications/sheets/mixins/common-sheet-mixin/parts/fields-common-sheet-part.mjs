/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockCommon} document
     */
    class FieldsCommonSheetPart extends Base {
      /**
       * Adds a key to a record field with validation.
       * @param {string} name - The field name.
       * @param {string} key - The key to add.
       * @param {Array} allowedKeys - Array of allowed keys.
       * @returns {Promise<void>} Promise that resolves when the field is updated.
       */
      async _addToRecordField(name, key, allowedKeys = []) {
        const existing = foundry.utils.getProperty(this.document, name);
        const copy = foundry.utils.deepClone(existing) || {};
        const updateData = {};

        // Remove invalid keys
        Object.keys(copy).forEach((k) => {
          if (k !== key && !allowedKeys.includes(k)) {
            updateData[`${name}.-=${k}`] = null;
          }
        });

        updateData[`${name}.${key}`] = null;
        await this.document.update(updateData);
      }

      /**
       * Cleans a record field by removing invalid keys.
       * @param {string} name - The field name.
       * @param {Array} allowedKeys - Array of allowed keys to keep.
       * @returns {Promise<void>} Promise that resolves when the field is cleaned.
       */
      async _cleanRecordField(name, allowedKeys = []) {
        const existing = foundry.utils.getProperty(this.document, name);
        const copy = foundry.utils.deepClone(existing) || {};
        const updateData = {};

        Object.keys(copy).forEach((k) => {
          if (!allowedKeys.includes(k)) {
            updateData[`${name}.-=${k}`] = null;
          }
        });

        await this.document.update(updateData);
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._setupUpdateHandlers();
        this._setupRecordFieldHandlers();
        this._setupChangeHandlers();
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
            const { index, part } = el.dataset;
            if (!name?.value) {
              return;
            }

            el.addEventListener("change", async (e) => {
              const existing = foundry.utils.getProperty(
                this.document,
                name.value,
              );
              const copy = foundry.utils.deepClone(existing) || [];
              copy[index][part] = e.currentTarget.value;
              await this.document.update({ [name.value]: copy });
            });
          },
        );

        // Remove change buttons
        this.element.querySelectorAll(".teriock-remove-change-button").forEach(
          /** @param {HTMLButtonElement} button */ (button) => {
            const { name } = button.attributes;
            const { index } = button.dataset;

            button.addEventListener("click", async () => {
              const existing = foundry.utils.getProperty(
                this.document,
                name.value,
              );
              const copy = foundry.utils.deepClone(existing) || [];
              copy.splice(index, 1);
              await this.document.update({ [name.value]: copy });
            });
          },
        );
      }

      /**
       * Sets up handlers for record field components.
       * Configures multi-select inputs and remove buttons for record fields.
       */
      _setupRecordFieldHandlers() {
        this.element
          .querySelectorAll(".teriock-record-field")
          .forEach((container) => {
            const select = container.querySelector("select");
            if (!select) {
              return;
            }

            const name = container.getAttribute("name");
            const allowedKeys = Array.from(select.options)
              .map((option) => option.value)
              .filter((value) => value !== "");

            select.addEventListener("input", async () => {
              await this._addToRecordField(name, select.value, allowedKeys);
            });

            container.querySelectorAll(".remove").forEach((btn) => {
              btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const target = /** @type {HTMLElement} */ e.currentTarget;
                const closest =
                  /** @type {HTMLElement} */ target.closest(".tag");
                const key = closest.dataset.key;
                await this._cleanRecordField(
                  name,
                  allowedKeys.filter((k) => k !== key),
                );
              });
            });
          });
      }

      /**
       * Sets up update handlers for various input types.
       * Configures change and click handlers for update inputs, select elements, and checkboxes.
       */
      _setupUpdateHandlers() {
        const handlers = [
          {
            selector: ".teriock-update-input",
            event: "change",
          },
          {
            selector: ".teriock-update-select",
            event: "change",
          },
          {
            selector: ".teriock-update-checkbox",
            event: "click",
            getValue: (el) => el.checked,
          },
        ];

        handlers.forEach(({ selector, event, getValue }) => {
          this.element.querySelectorAll(selector).forEach((el) => {
            const name = el.getAttribute("name");
            if (!name) {
              return;
            }

            el.addEventListener(event, async (e) => {
              if (event === "click") {
                e.preventDefault();
              }
              const target = /** @type {HTMLFormElement} */ e.currentTarget;

              const value = getValue
                ? getValue(target)
                : (target.value ?? target.getAttribute("data-value"));

              await this.document.update({ [name]: value });
            });
          });
        });
      }
    }
  );
};
