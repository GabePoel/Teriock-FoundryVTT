/**
 * Migrates actor data to the current schema version.
 * Handles data format conversions and updates.
 * @param {object} data - The actor data to migrate.
 * @property {string | number} [weight]
 * @returns {object} The migrated actor data.
 * @private
 */
export function _migrateData(data) {
  if (typeof data?.weight === "string" && data?.weight.includes("lb")) {
    data.weight = parseFloat(data.weight.replace("lb", "").trim());
  }
  return data;
}
