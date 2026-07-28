import { mixClasses } from "../../helpers/construction.mjs";
import { BaseApplicationMixin, DragDropApplicationMixin } from "../api/mixins/_module.mjs";

const { RollTableSheet } = foundry.applications.sheets;

/**
 * @mixes BaseApplication
 * @mixes DragDropSheet
 * @extends {RollTableSheet}
 */
export default class TeriockRollTableSheet
  extends mixClasses(RollTableSheet, BaseApplicationMixin, DragDropApplicationMixin)
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    teriock: {
      dragDrop: {
        dropBehavior: { effect: "copy", inherit: true },
        selectors: { drop: ".window-content" },
        style: { styleDropTarget: true },
      },
    },
  };

  /** @inheritDoc */
  _canDragDrop() {
    return this.isEditMode;
  }

  /** @inheritDoc */
  async _createResult(initialData = {}) {
    if (initialData.documentUuid) {
      const doc = await fromUuid(initialData.documentUuid);
      if (doc?.typedIdentifier) {
        foundry.utils.setProperty(initialData, "flags.teriock.documentIdentifier", doc.typedIdentifier);
        if (game.settings.get("teriock", "dontDropUuidsInTables")) { delete initialData.documentUuid; }
      }
    }
    return super._createResult(initialData);
  }
}
