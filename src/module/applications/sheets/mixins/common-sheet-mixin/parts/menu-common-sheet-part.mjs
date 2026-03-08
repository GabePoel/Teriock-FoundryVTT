/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class MenuCommonSheetPart extends Base {
      constructor(...args) {
        super(...args);
        this._menuOpen = false;
      }

      /**
       * Activates the sheet menu functionality.
       * Sets up menu toggle behavior and initial state.
       */
      _activateMenu() {
        const menu = this.element.querySelector(".ab-menu");
        const toggle = this.element.querySelector(".ab-menu-toggle");
        this._connect(".ab-menu-toggle", "click", () => {
          this._menuOpen = !this._menuOpen;
          menu.classList.toggle("collapsed", !this._menuOpen);
          toggle.classList.toggle("ab-menu-toggle-open", this._menuOpen);
        });
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._activateMenu();
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.menuCollapsed = !this._menuOpen;
        if (
          (this.document.system.constructor._automationTypes || []).length > 0
        ) {
          context.canHaveAutomations = true;
        }
        return context;
      }
    }
  );
};
