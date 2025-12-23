/**
 * @param {typeof DocumentSheetV2} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @mixin
     * @property {TeriockCommon} document
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
        /** @type {HTMLElement} */
        const menu = this.element.querySelector(".ab-menu");
        /** @type {HTMLElement} */
        const toggle = this.element.querySelector(".ab-menu-toggle");

        if (menu && this._menuOpen) {
          menu.classList.add("no-transition", "ab-menu-open");
          //eslint-disable-next-line @typescript-eslint/no-unused-expressions
          menu.offsetHeight;
          menu.classList.remove("no-transition");
          toggle.classList.add("ab-menu-toggle-open");
        }

        this._connect(".ab-menu-toggle", "click", () => {
          this._menuOpen = !this._menuOpen;
          menu.classList.toggle("ab-menu-open", this._menuOpen);
          toggle.classList.toggle("ab-menu-toggle-open", this._menuOpen);
        });
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._activateMenu();
      }
    }
  );
};
