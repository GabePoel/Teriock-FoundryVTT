/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function MechanicsTabsSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class MechanicsTabsSheet extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { toggleMechanics: this._onToggleMechanics } };

      /**
       * Toggles between the overview and mechanics tabs.
       * @param {PointerEvent} _event
       * @param {HTMLBaseElement} target
       * @returns {Promise<void>}
       */
      static async _onToggleMechanics(_event, target) {
        this._tab = this._tab === "mechanics" ? "overview" : "mechanics";
        await this.render();
        this._toggleCollapsed("menu", true);
        if (target.classList.contains("teriock-sheet-menu-mechanics-container")) {
          this.element.querySelector(".teriock-sheet-mechanics-close")?.focus();
        }
        if (target.classList.contains("teriock-sheet-mechanics-close")) {
          this.element.querySelector(".teriock-sheet-menu-mechanics-container")?.focus();
        }
      }

      constructor(...args) {
        super(...args);
        this._tab = "overview";
        this.#canHaveMechanics = Boolean(
          this.document.system.constructor._automationTypes?.length
            || this.document.system.constructor._affinityTypes?.length
            || this.document.system.constructor._expirationTypes?.length,
        );
      }

      /** @type {boolean} */
      #canHaveMechanics;

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
        return Object.assign(await super._prepareContext(options), {
          canHaveMechanics: this.#canHaveMechanics,
          tab: this._tab,
        });
      }
    }
  );
}
