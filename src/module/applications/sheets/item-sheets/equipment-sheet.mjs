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
    const storageWeight = this.document.system.storage.weight;
    const unlimitedStorageWeight = storageWeight.max.unitType !== "finite";
    return Object.assign(await super._prepareContext(options), {
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
      // Weight carried without a maximum is in pounds
      storageWeight: {
        abbreviation: unlimitedStorageWeight ? _loc("TERIOCK.WEIGHT.lb.symbol") : undefined,
        abbreviationTooltip: unlimitedStorageWeight ? _loc("TERIOCK.WEIGHT.lb.plural") : undefined,
        data: getStorageWeightString(storageWeight.value, storageWeight.max),
        source: getStorageWeightString(storageWeight.value, storageWeight.max.clone()),
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
 * Get the display string for the weight carried by storage.
 * @param {number} value - Weight carried in lb
 * @param {StorageMaxWeightModel} max
 * @returns {string}
 */
function getStorageWeightString(value, max) {
  if (max.unitType !== "finite") { return String(value); }
  return _loc("TERIOCK.FORMAT.outOf", {
    denominator: max.unitValue,
    numerator: (value / max.conversion).toNearest(TERIOCK.CONST.UNIT_PRECISION),
  });
}
