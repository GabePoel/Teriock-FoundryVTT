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
    class ImpactsTabsCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          changeImpactTab: this._onChangeImpactTab,
          toggleImpacts: this._onToggleImpacts,
        },
      };

      constructor(...args) {
        super(...args);
        this._impactTab = "base";
        this._tab = "overview";
      }

      /**
       * Switches to a specific impacts tab.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when tab is switched.
       * @static
       */
      static async _onChangeImpactTab(_event, target) {
        this._impactTab = target.dataset.tab;
        await this.render();
      }

      /**
       * Toggles between overview and impacts tabs.
       * @returns {Promise<void>} Promise that resolves when tab is toggled.
       * @static
       */
      static async _onToggleImpacts() {
        this._tab = this._tab === "impacts" ? "overview" : "impacts";
        await this.render();
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.impactTab = this._impactTab;
        context.tab = this._tab;
        return context;
      }
    }
  );
};
