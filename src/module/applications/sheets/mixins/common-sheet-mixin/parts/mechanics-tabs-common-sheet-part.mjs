/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function MechanicsTabsCommonSheetPart(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class MechanicsTabsCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { toggleMechanics: this._onToggleMechanics } };

      /**
       * Toggles between the overview and mechanics tabs.
       * @returns {Promise<void>}
       */
      static async _onToggleMechanics() {
        this._tab = this._tab === "mechanics" ? "overview" : "mechanics";
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
        this.element.querySelectorAll("[data-action='toggleMechanics']").forEach(
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
}
