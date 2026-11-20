import { mixClasses } from "../../../utils/_module.mjs";
import { InventoryManagementSheetMixin } from "../mixins/_module.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Equipment sheet.
 * @extends {ArmamentSheet}
 * @mixes InventoryManagementSheet
 * @property {TeriockItem<"equipment">} document
 */
export default class EquipmentSheet extends mixClasses(ArmamentSheet, InventoryManagementSheetMixin) {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/equipment/status-bar",
    "teriock/sheets/shared/bars/armament-bars",
    "teriock/sheets/items/equipment/load-bar",
    "teriock/sheets/shared/bars/consumable-bar",
    "teriock/sheets/items/equipment/ammunition-bar",
    "teriock/sheets/items/equipment/storage-bar",
  ];

  /** @inheritDoc */
  _validateDropEditable(options) {
    return (this.document.system.storage.enabled && this.document.isEditable && options.document?.type === "equipment")
      || super._validateDropEditable(options);
  }
}
