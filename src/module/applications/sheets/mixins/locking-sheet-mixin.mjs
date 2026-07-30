import { createElement } from "../../../helpers/html.mjs";

/**
 * @template {Constructor<TeriockDocumentSheet>} T
 * @param {T} Base
 */
export default function LockingSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class LockingSheet extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { toggleLockThis: this._onToggleLockThis }, teriock: { startLocked: true } };

      /**
       * Toggles the lock state of the current sheet.
       * @returns {Promise<void>}
       * @this {LockingSheet}
       */
      static async _onToggleLockThis() {
        this.#locked = !this.#locked;
        await this.render();
        game.tooltip.reactivate();
      }

      constructor(...args) {
        super(...args);
        this.#locked = this.options?.teriock?.startLocked ?? false;
      }

      /** @type {boolean} */
      #locked = false;

      /**
       * @param {HTMLButtonElement} toggleButton
       */
      #setToggleLockButtonAttributes(toggleButton) {
        toggleButton.classList.remove(...["fa-lock-open", "fa-lock"]);
        toggleButton.classList.add(...[this.isEditable ? "fa-lock-open" : "fa-lock"]);
        toggleButton.setAttribute(
          "data-tooltip",
          this.isEditable ? _loc("SIDEBAR.PLACEABLES.ACTIONS.Unlocked") : _loc("SIDEBAR.PLACEABLES.ACTIONS.Locked"),
        );
      }

      /** @inheritDoc */
      get isEditable() {
        return super.isEditable && !this.#locked;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        const toggleButton = this.window.header?.querySelector("[data-action='toggleLockThis']");
        if (toggleButton) { this.#setToggleLockButtonAttributes(toggleButton); }
        this.element.querySelectorAll("button[data-action='rollTable']").forEach((btn) => btn.disabled = false);
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (["ActiveEffect", "Item", "JournalEntryPage"].includes(this.document.documentName)) {
          const toggleButton = createElement("button", {
            className: "header-control icon fa-solid",
            dataset: { action: "toggleLockThis" },
            type: "button",
          });
          this.#setToggleLockButtonAttributes(toggleButton);
          if (!this.document.isOwner || (this.document.inCompendium && this.document.compendium.locked)) {
            toggleButton.setAttribute("disabled", "disabled");
          }
          this.window.controls?.before(toggleButton);
        }
        return frame;
      }
    }
  );
}
