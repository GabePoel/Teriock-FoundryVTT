/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseSheet}
   * @mixin
   */
  class SortingActorSheetPart extends Base {
    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-action='sheetSelect']").forEach(/** @param {HTMLInputElement} el */ el => {
        el.addEventListener("change", async () => {
          foundry.utils.setProperty(this, el.dataset.path, el.value);
          await this.render();
        });
      });
    }
  };
