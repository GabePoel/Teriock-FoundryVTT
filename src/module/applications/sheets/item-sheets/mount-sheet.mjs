import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Mount sheet.
 * @property {TeriockItem<"mount">} document
 */
export default class MountSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/mount/status-bar", "teriock/sheets/shared/bars/stat-bar"];

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      price: {
        data: getUnitValueString(this.document.system.price),
        locked: this.document.system.schema.getField("price").isLocked(this.document),
        source: getUnitValueString(this.document.system.price.clone()),
      },
    });
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
