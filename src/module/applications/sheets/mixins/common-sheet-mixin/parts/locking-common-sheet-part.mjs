/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  //noinspection JSAccessibilityCheck
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockCommon} document
     */
    class LockingCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          toggleLockThis: this._onToggleLockThis,
        },
      };

      constructor(...args) {
        super(...args);
        this._locked = true;
      }

      /**
       * Toggles the lock state of the current sheet.
       * @returns {Promise<void>}
       */
      static async _onToggleLockThis() {
        this._locked = !this._locked;
        await this.render();
        game.tooltip.reactivate();
      }

      /** @inheritDoc */
      get isEditable() {
        return super.isEditable && !this._locked;
      }

      /**
       * @param {HTMLButtonElement} toggleButton
       */
      #setToggleLockButtonAttributes(toggleButton) {
        toggleButton.classList.remove(
          ...[
            `fa-${TERIOCK.display.icons.ui.unlocked}`,
            `fa-${TERIOCK.display.icons.ui.locked}`,
          ],
        );
        toggleButton.classList.add(
          ...[
            this.isEditable
              ? `fa-${TERIOCK.display.icons.ui.unlocked}`
              : `fa-${TERIOCK.display.icons.ui.locked}`,
          ],
        );
        toggleButton.setAttribute(
          "data-tooltip",
          this.isEditable
            ? game.i18n.localize("TERIOCK.SHEETS.Common.ACTIONS.LockSheet.off")
            : game.i18n.localize("TERIOCK.SHEETS.Common.ACTIONS.LockSheet.on"),
        );
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        const toggleButton = this.window.header?.querySelector(
          "[data-action='toggleLockThis']",
        );
        if (toggleButton) {
          this.#setToggleLockButtonAttributes(toggleButton);
        }
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (
          this.document.documentName === "Item" ||
          this.document.documentName === "ActiveEffect" ||
          this.document.documentName === "JournalEntryPage"
        ) {
          const toggleButton = document.createElement("button");
          toggleButton.classList.add(...["header-control", "icon", "fa-solid"]);
          toggleButton.setAttribute("data-action", "toggleLockThis");
          this.#setToggleLockButtonAttributes(toggleButton);
          if (
            !this.document.isOwner ||
            (this.document.inCompendium && this.document.compendium.locked)
          ) {
            toggleButton.setAttribute("disabled", "disabled");
          }
          this.window.controls?.before(toggleButton);
        }
        return frame;
      }
    }
  );
};
