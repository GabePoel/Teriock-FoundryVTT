import documentConfig from "../../../constants/config/document-config.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {ArmamentSheet}
 * @mixes DragDropSheet
 * @property {TeriockEquipment} document
 */
export default class EquipmentSheet extends ArmamentSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/equipment/status-bar",
    ...super.BARS,
    "teriock/sheets/items/equipment/load-bar",
    "teriock/sheets/shared/bars/consumable-bar",
    "teriock/sheets/items/equipment/ammunition-bar",
    "teriock/sheets/items/equipment/storage-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    window: { icon: makeIconClass(documentConfig.equipment.icon, "title") },
  };

  /** @inheritDoc */
  _canDragDrop() {
    return this.document.isOwner;
  }

  /** @inheritDoc */
  _checkChildDropEditable(droppedDocument, behavior) {
    return (this.document.system.storage.enabled && this.document.isOwner && droppedDocument?.type === "equipment")
      || super._checkChildDropEditable(droppedDocument, behavior);
  }

  /** @inheritDoc */
  _defaultDropBehavior(droppedDocument) {
    // Equipment carried by the same actor is moved into or out of this container rather than duplicated.
    if (
      droppedDocument?.type === "equipment" && droppedDocument.actor && droppedDocument.actor === this.document.actor
    ) { return "move"; }
    return super._defaultDropBehavior(droppedDocument);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      rangeString: this.document.system.range.long.unitType === "finite"
        ? secondaryFormat(this.document.system.range.long.formula, this.document.system.range.short.formula, {
          reverse: true,
          secondFilter: formulaExists,
        })
        : this.document.system.range.long.text,
      sourceRangeString: this.document.system.range.long.unitType === "finite"
        ? secondaryFormat(this.document.system._source.range.long.raw, this.document.system._source.range.short.raw, {
          reverse: true,
          secondFilter: formulaExists,
        })
        : this.document.system.range.long.text,
    });
  }
}
