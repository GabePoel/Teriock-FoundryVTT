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
        this.render();
      }

      /** @inheritDoc */
      get isEditable() {
        return super.isEditable && !this._locked;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        const toggleButton = this.window.header.querySelector(
          "[data-action='toggleLockThis']",
        );
        if (toggleButton) {
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
            this.isEditable ? "Unlocked" : "Locked",
          );
        }
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (
          this.document.documentName === "Item" ||
          this.document.documentName === "ActiveEffect"
        ) {
          const toggleButton = document.createElement("button");
          toggleButton.classList.add(
            ...[
              "header-control",
              "icon",
              "fa-solid",
              this.isEditable
                ? `fa-${TERIOCK.display.icons.ui.unlocked}`
                : `fa-${TERIOCK.display.icons.ui.locked}`,
            ],
          );
          toggleButton.setAttribute("data-action", "toggleLockThis");
          toggleButton.setAttribute(
            "data-tooltip",
            this.isEditable ? "Unlocked" : "Locked",
          );
          if (
            !this.document.isOwner ||
            (this.document.inCompendium && this.document.compendium.locked)
          ) {
            toggleButton.setAttribute("disabled", "disabled");
          }
          this.window.controls.before(toggleButton);
        }
        return frame;
      }
    }
  );
};
