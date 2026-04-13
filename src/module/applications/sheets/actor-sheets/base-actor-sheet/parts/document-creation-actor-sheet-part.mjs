import { ucFirst } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";

export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class DocumentCreationActorSheetPart extends Base {
    /**
     * Create and connect a context menu to create the provided document types.
     * @param {string} cssClass
     * @param {Teriock.Documents.ChildType[]} types
     */
    #createContextMenu(cssClass, types) {
      this._connectContextMenu(
        cssClass,
        types.map((t) => this.#createContextMenuEntry(t)),
        "contextmenu",
        undefined,
        true,
      );
    }

    /**
     * Context menu entry to create a given document type.
     * @param {Teriock.Documents.ChildType} type
     * @returns {ContextMenuEntry}
     */
    #createContextMenuEntry(type) {
      return {
        icon: makeIconClass(TERIOCK.options.document[type].icon, "contextMenu"),
        label: _loc("TERIOCK.DIALOGS.NewDocument.title", {
          name: TERIOCK.options.document[type].name,
        }),
        onClick: this.constructor[`_onCreate${ucFirst(type)}`].bind(this),
      };
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      if (!this.isEditable) return;
      this.#createContextMenu(".equipment-add-button", [
        "equipment",
        "body",
        "mount",
      ]);
      this.#createContextMenu(".consequence-add-button", [
        "consequence",
        "attunement",
      ]);
      this.#createContextMenu(".power-add-button", ["species", "power"]);
    }
  };
