/**
 * Migrates property data to the current schema version.
 * Handles data format conversions for effects, costs, and other property properties.
 * @param {object} data - The property data to migrate.
 * @returns {Partial<TeriockPropertyModel>} The migrated property data.
 * @private
 */
export function _migrateData(data) {
  if (foundry.utils.getProperty(data, "propertyType")) {
    foundry.utils.setProperty(data, "form", foundry.utils.getProperty(data, "propertyType"));
  }
}
