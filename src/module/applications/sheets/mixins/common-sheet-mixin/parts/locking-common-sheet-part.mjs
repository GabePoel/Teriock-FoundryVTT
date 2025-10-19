export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class LockingCommonSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          toggleLockThis: this._toggleLockThis,
        },
      };

      constructor(...args) {
        super(...args);
        this._locked = true;
      }

      /**
       * Toggles the lock state of the current sheet.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when lock is toggled.
       */
      static async _toggleLockThis(_event, _target) {
        this._locked = !this._locked;
        this.editable = Boolean(this.isEditable && !this._locked);
        this.render();
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        const toggleButton = this.window.header.querySelector(
          "[data-action='toggleLockThis']",
        );
        if (toggleButton) {
          toggleButton.classList.remove(...["fa-lock-open", "fa-lock"]);
          toggleButton.classList.add(
            ...[this.editable ? "fa-lock-open" : "fa-lock"],
          );
          toggleButton.setAttribute(
            "data-tooltip",
            this.editable ? "Unlocked" : "Locked",
          );
        }
        this.editable = this.isEditable && !this._locked;
      }

      /** @inheritDoc */
      async _renderFrame(options) {
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
              this.editable ? "fa-lock-open" : "fa-lock",
            ],
          );
          toggleButton.setAttribute("data-action", "toggleLockThis");
          toggleButton.setAttribute(
            "data-tooltip",
            this.editable ? "Unlocked" : "Locked",
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
