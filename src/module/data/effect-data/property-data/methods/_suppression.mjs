/**
 * Checks if a property should be suppressed based on various conditions.
 * Considers equipment state, attunement, and sup effect modifications.
 * @param {TeriockPropertyData} propertyData - The property data to check for suppression.
 * @returns {boolean} True if the ability should be suppressed, false otherwise.
 * @private
 */
export function _suppressed(propertyData) {
  let suppressed = false;
  if (!suppressed && propertyData.parent.parent.type === "equipment") {
    if (!suppressed && !propertyData.parent.parent.system.equipped && propertyData.modifies === "Actor") {
      suppressed = true;
    }
    if (!suppressed
      && propertyData.parent.parent.system.dampened
      && propertyData.form
      !== "intrinsic"
      && !propertyData.applyIfDampened) {
      suppressed = true;
    }
  }
  if (!suppressed && propertyData.parent.parent.system.shattered && !propertyData.applyIfShattered) {
    suppressed = true;
  }
  if (!suppressed && propertyData.actor && propertyData.parent.sup) {
    const sups = propertyData.parent.allSups;
    if (sups.some((sup) => !sup.modifiesActor)) {
      suppressed = true;
    }
  }
  return suppressed;
}
