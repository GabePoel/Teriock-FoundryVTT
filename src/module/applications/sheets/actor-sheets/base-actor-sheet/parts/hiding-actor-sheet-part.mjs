/**
 * @param {typeof TeriockBaseActorSheet} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorSheet}
     * @property {TeriockCommon} document
     */
    class HidingActorSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          toggleHideThis: this._onToggleHideThis,
        },
      };

      constructor(...args) {
        super(...args);
        this._hideInactive = game.settings.get(
          "teriock",
          "hideInactiveDocumentsByDefault",
        );
      }

      /**
       * Toggles the lock state of the current sheet.
       * @returns {Promise<void>} Promise that resolves when lock is toggled.
       */
      static async _onToggleHideThis() {
        this._hideInactive = !this._hideInactive;
        this.render();
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        const toggleButton = this.window.header.querySelector(
          "[data-action='toggleHideThis']",
        );
        if (toggleButton) {
          toggleButton.classList.remove(...["fa-eye", "fa-eye-slash"]);
          toggleButton.classList.add(
            ...[this._hideInactive ? "fa-eye-slash" : "fa-eye"],
          );
          toggleButton.setAttribute(
            "data-tooltip",
            this._hideInactive ? "Inactive Hidden" : "Inactive Visible",
          );
        }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.hideInactive = this._hideInactive;
        return context;
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        const toggleButton = document.createElement("button");
        toggleButton.classList.add(
          ...[
            "header-control",
            "icon",
            "fa-solid",
            this._hideInactive ? "fa-eye-slash" : "fa-eye",
          ],
        );
        toggleButton.setAttribute("data-action", "toggleHideThis");
        toggleButton.setAttribute(
          "data-tooltip",
          this._hideInactive ? "Inactive Hidden" : "Inactive Visible",
        );
        this.window.controls.before(toggleButton);
        return frame;
      }
    }
  );
};
