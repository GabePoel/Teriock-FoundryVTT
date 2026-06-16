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
        this.setPreviewSource(path, !current);
        await this.render();
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        /** @type {NodeListOf<HTMLToggleButtonElement>} */
        const toggleButtons = this.element.querySelectorAll("toggle-button[data-path]");
        toggleButtons.forEach(el => {
          el.addEventListener("change", async () => {
            this.setPreviewSource(el.dataset.path, el.value);
            const menuMatch = el.dataset.path?.match(/^previewMenus\.([^.]+)\.menus\.([^.]+)$/);
            if (menuMatch) {
              const [, type, menu] = menuMatch;
              const content = this.element.querySelector(
                `.teriock-block-options-content[data-content-type="${type}"][data-content-menu="${menu}"]`,
              );
              content?.classList.toggle("collapsed", !el.value);
              return;
            }
            await this.render();
          });
        });
        this.element.querySelectorAll("[data-action='sheetSelect']").forEach(/** @param {HTMLInputElement} el */ el => {
          el.addEventListener("change", async () => {
            this.setPreviewSource(el.dataset.path, el.value);
            await this.render();
          });
        });
      }
    }
  );
};
