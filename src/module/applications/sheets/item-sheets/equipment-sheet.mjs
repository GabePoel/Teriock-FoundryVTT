import { FormulaField } from "../../../data/fields/_module.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
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
  async _prepareContext(options) {
    const sourceLong = this.document.system.range.long.clone();
    return Object.assign(await super._prepareContext(options), {
      price: {
        data: getUnitValueString(this.document.system.price),
        locked: this.document.system.schema.getField("price").isLocked(this.document),
        source: getUnitValueString(this.document.system.price.clone()),
      },
      range: {
        data: this.document.system.range.long.unitType === "finite"
          ? secondaryFormat(this.document.system.range.long.raw, this.document.system.range.short.raw, {
            reverse: true,
            secondFilter: FormulaField.exists,
          })
          : this.document.system.range.long.label,
        source: sourceLong.unitType === "finite"
          ? secondaryFormat(sourceLong.raw, this.document.system._source.range.short.raw, {
            reverse: true,
            secondFilter: FormulaField.exists,
          })
          : sourceLong.label,
      },
      weight: {
        data: getUnitValueString(this.document.system.weight),
        locked: this.document.system.schema.getField("weight").isLocked(this.document),
        source: getUnitValueString(this.document.system.weight.clone()),
      },
    });
  }

  /** @inheritDoc */
  _validateDropEditable(options) {
    return (this.document.system.storage.enabled && this.document.isEditable && options.document?.type === "equipment")
      || super._validateDropEditable(options);
  }
}

/**
 * Get the display string for a unit value, evaluated in its own unit.
 * @param {BaseUnitModel} unitModel
 * @returns {string}
 */
function getUnitValueString(unitModel) {
  return unitModel.unitType === "finite" ? String(unitModel.unitValue) : unitModel.label;
}
