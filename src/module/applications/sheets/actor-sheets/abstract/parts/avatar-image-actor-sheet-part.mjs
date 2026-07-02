/**
 * @param {typeof BaseActorSheet} Base
 */
export default function AvatarImageActorSheetPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @property {Teriock.Sheet.BaseActorSheetSettings} settings
     * @mixin
     */
    class AvatarImageActorSheetPart extends Base {
      /**
       * Toggle which image is shown.
       * @returns {Promise<void>}
       * @this {AvatarImageActorSheetPart}
       */
      static async #onSwitchImage() {
        if (this.#imageToDisplay === "actor") {
          this.#imageToDisplay = "token";
        } else {
          this.#imageToDisplay = "actor";
        }
        await this.render();
      }

      /**
       * Toggles whether the prototype token has a ring.
       * @returns {Promise<void>}
       */
      static async #onToggleRing() {
        if (this.document.token) {
          await this.document.token.update({ "ring.enabled": !this.document.token.ring.enabled });
          await this.render();
        } else {
          await this.document.update({ "prototypeToken.ring.enabled": !this.document.prototypeToken.ring.enabled });
        }
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { switchImage: this.#onSwitchImage, toggleRing: this.#onToggleRing } };

      /** @type {"actor"|"token"} */
      #imageToDisplay = "actor";

      /**
       * Path to the current image on the actor.
       * @returns {string}
       */
      get displayedImgPath() {
        if (this.#imageToDisplay === "actor") { return "img"; }
        return (this.imgToken.ring.enabled && this.imgToken.ring.subject.texture)
          ? `${this.tokenPrefix}.ring.subject.texture`
          : `${this.tokenPrefix}.texture.src`;
      }

      /**
       * Tooltip to display for the current image.
       * @returns {string}
       */
      get displayedImgTooltip() {
        if (this.#imageToDisplay === "actor") { return _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgActor"); }
        return this.imgToken.ring.enabled
          ? _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgRing")
          : _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgToken");
      }

      /**
       * Path to the current image being edited.
       * @returns {string}
       */
      get editableImgPath() {
        if (this.#imageToDisplay === "actor") { return "img"; }
        return this.imgToken.ring.enabled
          ? `${this.tokenPrefix}.ring.subject.texture`
          : `${this.tokenPrefix}.texture.src`;
      }

      /**
       * The token with the image to edit.
       * @returns {TeriockTokenDocument}
       */
      get imgToken() {
        return this.document.token ?? this.document.prototypeToken;
      }

      /**
       * A prefix for image paths.
       * @returns {string}
       */
      get tokenPrefix() {
        return this.document.token ? "token" : "prototypeToken";
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          displayedImg: foundry.utils.getProperty(this.document, this.displayedImgPath),
          displayedImgDocument: this.#imageToDisplay,
          displayedImgIcon: this.#imageToDisplay === "actor"
            ? TERIOCK.display.icons.document.character
            : TERIOCK.display.icons.document.token,
          displayedImgPath: this.displayedImgPath,
          displayedImgRing: this.#imageToDisplay === "token" && this.imgToken.ring.enabled,
          displayedImgTooltip: this.displayedImgTooltip,
          editableImgPath: this.editableImgPath,
        });
      }
    }
  );
}
