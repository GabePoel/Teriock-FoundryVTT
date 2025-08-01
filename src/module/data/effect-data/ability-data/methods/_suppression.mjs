/**
 * Checks if an ability should be suppressed based on various conditions.
 * Considers equipment state, attunement, and sup effect modifications.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to check for suppression.
 * @returns {boolean} True if the ability should be suppressed, false otherwise.
 * @private
 */
export function _suppressed(abilityData) {
  let suppressed = false;
  if (!suppressed && abilityData.parent.isReference) suppressed = true;
  if (!suppressed && abilityData.parent.parent.type === "equipment") {
    if (!suppressed && !abilityData.parent.parent.system.equipped) {
      suppressed = true;
    }
    if (!suppressed && abilityData.parent.parent.system.dampened) {
      suppressed = true;
    }
    if (!suppressed && abilityData.abilityType !== "intrinsic") {
      const isAttuned = abilityData.parent.parent.system.isAttuned;
      suppressed = !isAttuned;
    }
  }
  if (!suppressed && abilityData.actor && abilityData.parent.sup) {
    const sups = abilityData.parent.allSups;
    if (sups.some((sup) => !sup.modifiesActor)) {
      suppressed = true;
    }
  }
  return suppressed;
}
