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
    class MenuCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: { toggleMenu: this._onToggleMenu },
      };

      /**
       * Toggle whether the menu is open.
       * @returns {Promise<void>}
       * @this {MenuCommonSheetPart}
       */
      static async _onToggleMenu() {
        this.toggleMenu();
      }

      constructor(...args) {
        super(...args);
        this._menuOpen = false;
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.menuCollapsed = !this._menuOpen;
        if ((this.document.system.constructor._automationTypes || []).length > 0) {
          context.canHaveAutomations = true;
        }
        return context;
      }

      /**
       * Toggle menu state.
       * @param {boolean} [state]
       */
      toggleMenu(state) {
        this._menuOpen = state ?? !this._menuOpen;
        this.element.querySelector(".ab-menu")?.classList.toggle("collapsed", !this._menuOpen);
        this.element.querySelector(".ab-menu-toggle")?.classList.toggle("ab-menu-toggle-open", this._menuOpen);
      }
    }
  );
};
