export default (Base) =>
  class AvatarImageActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        switchImage: this._switchImage,
      },
    };

    /**
     * Toggle which image is shown.
     * @returns {Promise<void>}
     * @private
     */
    static async _switchImage() {
      if (this.settings.avatarImagePath === "img") {
        this.settings.avatarImagePath = "prototypeToken.texture.src";
      } else {
        this.settings.avatarImagePath = "img";
      }
      await this.render();
    }

    async _prepareContext(options) {
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
