import { TeriockDragDrop } from "../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function MechanicsTabsSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixes DragDropSheet
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
       * @this {MechanicsTabsSheet}
       */
      static async _onToggleMechanics(_event, target) {
        await this._safeToggleMechanics();
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

      /** @type {string|null} */
      #tabBeforeDrag = null;

      /** @inheritDoc */
      _dropEffect(event) {
        const dropEffect = super._dropEffect(event);
        if (dropEffect === "none" || this._tab !== "mechanics") { return dropEffect; }
        // While the mechanics tab is shown, only mechanics can be dropped on the sheet itself.
        return this._mechanicCollectionFor(TeriockDragDrop.payload?.type) ? dropEffect : "none";
      }

      /** @inheritDoc */
      async _onDragLeaveApplication() {
        await super._onDragLeaveApplication();
        if (!this.#tabBeforeDrag) { return; }
        const tab = this.#tabBeforeDrag;
        this.#tabBeforeDrag = null;
        await this._safeToggleMechanics(tab);
      }

      /** @inheritDoc */
      async _onDragOver(event) {
        await super._onDragOver(event);
        if (this._tab === "mechanics" || event.dataTransfer.dropEffect === "none") { return; }
        if (this._fieldDropTarget(event) || !this._mechanicCollectionFor(TeriockDragDrop.payload?.type)) { return; }
        this.#tabBeforeDrag = this._tab;
        await this._safeToggleMechanics("mechanics");
      }

      /** @inheritDoc */
      async _onDrop(event) {
        this.#tabBeforeDrag = null;
        await super._onDrop(event);
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
        return Object.assign(await super._prepareContext(options), {
          canHaveMechanics: this.#canHaveMechanics,
          tab: this._tab,
        });
      }

      /**
       * Safely switch between the overview and mechanics tabs.
       * @param {string} [tab] - The tab to show. Defaults to whichever isn't currently shown.
       * @returns {Promise<void>}
       */
      async _safeToggleMechanics(tab) {
        this._tab = tab ?? (this._tab === "mechanics" ? "overview" : "mechanics");
        await this.render();
        this._toggleCollapsed("menu", true);
      }
    }
  );
}
