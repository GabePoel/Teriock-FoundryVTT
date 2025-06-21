/** @import TeriockResourceData from "../resource-data.mjs" */

/**
 * @param {object} data
 * @returns {Partial<TeriockResourceData>}
 * @private
 */
export function _migrateData(data) {
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