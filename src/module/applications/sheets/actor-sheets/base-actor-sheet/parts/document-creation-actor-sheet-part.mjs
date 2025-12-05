import { changeSizeDialog } from "../../../../dialogs/_module.mjs";

/**
 * @param {typeof DragDropCommonSheetPart} Base
 * @constructor
 */
export default (Base) =>
  /**
   * @mixin
   */
  class DocumentCreationActorSheetPart extends Base {
    /** @inheritDoc */
    _canDrop(doc) {
      if (doc.type === "ability") {
        return false;
      } else {
        return super._canDrop(doc);
      }
    }

    /** @inheritDoc */
    async _onDropChild(event, dropData) {
      const created = await super._onDropChild(event, dropData);
      if (created?.type === "species") {
        if (created?.system?.size?.enabled) {
          await changeSizeDialog(this.actor, created);
        }
      } else if (created?.type === "equipment") {
        const doc = await Item.fromDropData(dropData);
        if (doc.isOwner && doc.elder?.documentName === "Actor") {
          await doc.delete();
        }
      }
      return created;
    }
  };
