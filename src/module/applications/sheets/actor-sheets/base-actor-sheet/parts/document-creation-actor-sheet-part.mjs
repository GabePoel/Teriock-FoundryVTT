import { ucFirst } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";

export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class DocumentCreationActorSheetPart extends Base {
    /**
     * Context menu entry to create a given document type.
     * @param {Teriock.Documents.ChildType} type
     * @returns {Teriock.Foundry.ContextMenuEntry}
     */
    #createContextMenuEntry(type) {
      return {
        icon: makeIconClass(TERIOCK.options.document[type].icon, "contextMenu"),
        name: game.i18n.format("TERIOCK.DIALOGS.NewDocument.title", {
          name: TERIOCK.options.document[type].name,
        }),
        callback: this.constructor[`_onCreate${ucFirst(type)}`].bind(this),
      };
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      if (!this.isEditable) return;
      this._connectContextMenu(
        ".equipment-add-button",
        [
          this.#createContextMenuEntry("equipment"),
          this.#createContextMenuEntry("body"),
          this.#createContextMenuEntry("mount"),
        ],
        "contextmenu",
        undefined,
        true,
      );
      this._connectContextMenu(
        ".power-add-button",
        [
          this.#createContextMenuEntry("power"),
          this.#createContextMenuEntry("species"),
        ],
        "contextmenu",
        undefined,
        true,
      );
    }
  };
