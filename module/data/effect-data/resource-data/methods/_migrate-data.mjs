/**
 * Migrates resource data from older versions to the current format.
 * Converts numeric maxQuantity to the new schema format with raw and derived fields.
 * @param {object} data - The resource data to migrate.
 * @returns {Partial<TeriockResourceData>} The migrated resource data.
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
