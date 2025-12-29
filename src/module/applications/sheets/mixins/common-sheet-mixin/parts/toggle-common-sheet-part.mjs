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
    class ToggleCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          quickToggle: this._onQuickToggle,
          sheetToggle: this._onSheetToggle,
        },
      };

      /**
       * Toggles a boolean field on the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onQuickToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        await this.document.update({ [path]: !current });
      }

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
    }
  );
};
