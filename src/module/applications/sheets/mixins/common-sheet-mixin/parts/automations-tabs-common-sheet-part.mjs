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
    class AutomationsTabsCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { toggleAutomations: this._onToggleAutomations } };

      /**
       * Toggles between overview and impacts tabs.
       * @returns {Promise<void>}
       */
      static async _onToggleAutomations() {
        this._tab = this._tab === "automations" ? "overview" : "automations";
        await this.render();
        if (typeof this.toggleMenu === "function") { this.toggleMenu(false); }
      }

      constructor(...args) {
        super(...args);
        this._tab = "overview";
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.querySelectorAll("[data-action='toggleAutomations']").forEach(
          /** @param {HTMLButtonElement} el */ el => {
            el.disabled = false;
          },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), { tab: this._tab });
      }
    }
  );
};
