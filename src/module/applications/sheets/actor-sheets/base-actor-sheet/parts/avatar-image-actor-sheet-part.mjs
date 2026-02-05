//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class AvatarImageActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        switchImage: this.#onSwitchImage,
        toggleRing: this.#onToggleRing,
      },
    };

    /**
     * Toggle which image is shown.
     * @returns {Promise<void>}
     */
    static async #onSwitchImage() {
      if (this.settings.avatarImagePath === "img") {
        this.settings.avatarImagePath = "prototypeToken.texture.src";
      } else {
        this.settings.avatarImagePath = "img";
      }
      await this.render();
    }

    /**
     * Toggles whether the prototype token has a ring.
     * @returns {Promise<void>}
     */
    static async #onToggleRing() {
      await this.document.update({
        "prototypeToken.ring.enabled":
          !this.document.prototypeToken.ring.enabled,
      });
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.avatarImagePath = this.settings.avatarImagePath;
      if (context.avatarImagePath === "img") {
        context.avatarTooltip = "Actor Image";
        context.avatarIcon = `fa-${TERIOCK.display.icons.document.character}`;
      } else {
        context.avatarTooltip = "Token Image";
        context.avatarIcon = `fa-${TERIOCK.display.icons.document.token}`;
      }
      return context;
    }
  };
