import { mixClasses } from "../../../helpers/construction.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import { InventoryManagementSheetMixin } from "../mixins/_module.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {ArmamentSheet}
 * @mixes DragDropSheet
 * @mixes InventoryManagementSheet
 * @property {TeriockEquipment} document
 */
export default class EquipmentSheet extends mixClasses(ArmamentSheet, InventoryManagementSheetMixin) {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/equipment/status-bar",
    ...super.BARS,
    "teriock/sheets/items/equipment/load-bar",
    "teriock/sheets/shared/bars/consumable-bar",
    "teriock/sheets/items/equipment/ammunition-bar",
    "teriock/sheets/items/equipment/storage-bar",
  ];

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      rangeString: this.document.system.range.long.unitType === "finite"
        ? secondaryFormat(this.document.system.range.long.raw, this.document.system.range.short.raw, {
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

  /** @inheritDoc */
  _validateDropEditable(options) {
    return (this.document.system.storage.enabled && this.document.isOwner && options.document?.type === "equipment")
      || super._validateDropEditable(options);
  }
}
