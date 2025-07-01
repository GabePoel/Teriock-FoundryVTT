/** @import TeriockEquipmentData from "../equipment-data.mjs" */

/**
 * Migrates equipment data from older versions to the current format.
 * Converts numeric tier and maxQuantity values to the new schema format with raw and derived fields.
 * @param {object} data - The equipment data to migrate.
 * @returns {Partial<TeriockEquipmentData>} The migrated equipment data.
 * @private
 */
export function _migrateData(data) {
  if (!Object.prototype.hasOwnProperty.call(data, "tier")) {
    if (!data.tier) {
      data.tier = "";
    }
    if (data.tier) {
      if (typeof data.tier === "string" || typeof data.tier === "number") {
        const rawTier = String(data.tier) || "";
        const derivedTier = Number(data.tier) || 0;
        data.tier = {
          raw: rawTier,
          derived: derivedTier,
        };
      }
    }
  }
  if (data.maxQuantity && typeof data.maxQuantity === "number") {
    const rawMaxQuantity = String(data.maxQuantity) || "";
    const derivedMaxQuantity = Number(data.maxQuantity) || 0;
    data.maxQuantity = {
      raw: rawMaxQuantity,
      derived: derivedMaxQuantity,
    };
  }
  return data;
}
