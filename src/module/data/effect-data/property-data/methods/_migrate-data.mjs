/**
 * Migrates property data to the current schema version.
 * Handles data format conversions for effects, costs, and other property properties.
 * @param {object} data - The property data to migrate.
 * @returns {Partial<TeriockPropertyModel>} The migrated property data.
 * @private
 */
export function _migrateData(data) {
  // Form migration
  if (foundry.utils.getProperty(data, "propertyType")) {
    foundry.utils.setProperty(
      data,
      "form",
      foundry.utils.getProperty(data, "propertyType"),
    );
  }

  // Impact migration
  if (foundry.utils.hasProperty(data, "applies")) {
    data.impacts = foundry.utils.getProperty(data, "applies");
    foundry.utils.deleteProperty(data, "applies");
  }
  return data;
}
