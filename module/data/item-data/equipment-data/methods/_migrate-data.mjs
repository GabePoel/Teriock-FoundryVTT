/** @import TeriockEquipmentData from "../equipment-data.mjs" */

/**
 * @param {object} data
 * @returns {Partial<TeriockEquipmentData>}
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