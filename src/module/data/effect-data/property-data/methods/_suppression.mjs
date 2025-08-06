/**
 * Checks if a property should be suppressed based on various conditions.
 * Considers equipment state, attunement, and sup effect modifications.
 *
 * @param {TeriockPropertyData} propertyData - The property data to check for suppression.
 * @returns {boolean} True if the ability should be suppressed, false otherwise.
 * @private
 */
export function _suppressed(propertyData) {
  let suppressed = false;
  if (!suppressed && propertyData.parent.parent.type === "equipment") {
    if (!suppressed && !propertyData.parent.parent.system.equipped) {
      suppressed = true;
    }
    if (
      !suppressed &&
      propertyData.parent.parent.system.dampened &&
      propertyData.form !== "intrinsic"
    ) {
      suppressed = true;
    }
    if (!suppressed && propertyData.form !== "intrinsic") {
      const isAttuned = propertyData.parent.parent.system.isAttuned;
      suppressed = !isAttuned;
    }
  }
  return suppressed;
}
