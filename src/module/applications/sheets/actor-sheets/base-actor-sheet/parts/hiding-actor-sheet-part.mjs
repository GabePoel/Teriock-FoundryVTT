//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
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
     * @returns {Promise<void>}
     */
    static async _onToggleHideThis() {
      this._hideInactive = !this._hideInactive;
      await this.render();
      game.tooltip.reactivate();
    }

    /**
     * @param {HTMLButtonElement} toggleButton
     */
    #setToggleHideButtonAttributes(toggleButton) {
      toggleButton.classList.remove(
        ...[
          `fa-${TERIOCK.display.icons.ui.show}`,
          `fa-${TERIOCK.display.icons.ui.hide}`,
        ],
      );
      toggleButton.classList.add(
        ...[
          this._hideInactive
            ? `fa-${TERIOCK.display.icons.ui.hide}`
            : `fa-${TERIOCK.display.icons.ui.show}`,
        ],
      );
      toggleButton.setAttribute(
        "data-tooltip",
        this._hideInactive
          ? game.i18n.localize("TERIOCK.SHEETS.Actor.ACTIONS.HideInactive.on")
          : game.i18n.localize("TERIOCK.SHEETS.Actor.ACTIONS.HideInactive.off"),
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      const toggleButton = this.window.header.querySelector(
        "[data-action='toggleHideThis']",
      );
      if (toggleButton) {
        this.#setToggleHideButtonAttributes(toggleButton);
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
      toggleButton.classList.add(...["header-control", "icon", "fa-solid"]);
      toggleButton.setAttribute("data-action", "toggleHideThis");
      this.#setToggleHideButtonAttributes(toggleButton);
      this.window.controls.before(toggleButton);
      return frame;
    }
  };
