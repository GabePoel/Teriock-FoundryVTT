import { makeIconClass } from "../../../../../helpers/icon.mjs";

export default Base =>
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
        types.map(t => this.#createContextMenuEntry(t)),
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
        icon: makeIconClass(TERIOCK.config.document[type].icon, "contextMenu"),
        label: _loc("TERIOCK.SHEETS.Common.PREVIEW.addType", { type: TERIOCK.config.document[type].label }),
        onClick: () => this._createChild(type),
      };
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      if (!this.isEditable) { return; }
      this.#createContextMenu(".equipment-add-button", ["equipment", "body", "mount"]);
      this.#createContextMenu(".consequence-add-button", ["consequence", "attunement"]);
      this.#createContextMenu(".power-add-button", ["species", "power"]);
    }

    /** @inheritDoc */
    async _prepareContext(options) {
      const miscTypes = ["base", "condition", "cover", "hack"];
      return Object.assign(await super._prepareContext(options), {
        miscEffects: this.document.effects.filter(e => miscTypes.includes(e.type) && !e.isStatus),
      });
    }
  };
