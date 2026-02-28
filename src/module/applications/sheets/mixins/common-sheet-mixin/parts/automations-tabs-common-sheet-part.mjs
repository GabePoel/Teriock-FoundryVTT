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
    class AutomationsTabsCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          changeAutomationTab: this._onChangeAutomationTab,
          toggleAutomations: this._onToggleAutomations,
        },
      };

      constructor(...args) {
        super(...args);
        this._automationTab = "base";
        this._tab = "overview";
      }

      /**
       * Switches to a specific impacts tab.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onChangeAutomationTab(_event, target) {
        this._impactTab = target.dataset.tab;
        await this.render();
      }

      /**
       * Toggles between overview and impacts tabs.
       * @returns {Promise<void>}
       */
      static async _onToggleAutomations() {
        this._tab = this._tab === "automations" ? "overview" : "automations";
        await this.render();
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element
          .querySelectorAll("[data-action='toggleAutomations']")
          .forEach(
            /** @param {HTMLButtonElement} el */ (el) => {
              el.disabled = false;
            },
          );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.automationTab = this._automationTab;
        context.tab = this._tab;
        return context;
      }
    }
  );
};
