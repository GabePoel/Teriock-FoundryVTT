export default (Base) =>
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
     * @private
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
     * @private
     */
    static async #onToggleRing() {
      await this.document.update({
        "prototypeToken.ring.enabled":
          !this.document.prototypeToken.ring.enabled,
      });
    }

    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.avatarImagePath = this.settings.avatarImagePath;
      if (context.avatarImagePath === "img") {
        context.avatarTooltip = "Actor Image";
        context.avatarIcon = "fa-user";
      } else {
        context.avatarTooltip = "Token Image";
        context.avatarIcon = "fa-user-circle";
      }
      return context;
    }
  };
