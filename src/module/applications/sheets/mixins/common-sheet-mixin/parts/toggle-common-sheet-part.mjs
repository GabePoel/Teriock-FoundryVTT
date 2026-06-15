/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class ToggleCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { sheetToggle: this._onSheetToggle } };

      /**
       * Toggles a boolean field on the sheet and re-renders.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onSheetToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        foundry.utils.setProperty(this, path, !current);
        await this.render();
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        /** @type {NodeListOf<HTMLToggleButtonElement>} */
        const toggleButtons = this.element.querySelectorAll("toggle-button[data-path]");
        toggleButtons.forEach(el => {
          el.addEventListener("change", async () => {
            foundry.utils.setProperty(this, el.dataset.path, el.value);
            await this.render();
          });
        });
      }
    }
  );
};
