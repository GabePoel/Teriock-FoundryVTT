import { changeSizeDialog } from "../../../../dialogs/_module.mjs";

export default (Base) =>
  class DocumentCreationActorSheetPart extends Base {
    //noinspection JSUnusedGlobalSymbols
    _canDrop(doc) {
      if (doc.type === "ability") {
        return false;
      } else {
        return super._canDrop(doc);
      }
    }

    //noinspection JSUnusedGlobalSymbols
    async _onDropItem(event, data) {
      const item = await super._onDropItem(event, data);
      if (item?.type === "species") {
        if (item?.system?.size?.enabled) {
          await changeSizeDialog(this.actor, item);
        }
      }
      return item;
    }
  };
