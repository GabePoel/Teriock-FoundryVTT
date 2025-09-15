/**
 * Checks if an ability should be suppressed based on various conditions.
 * Considers equipment state, attunement, and sup effect modifications.
 * @param {TeriockAbilityModel} abilityData - The ability data to check for suppression.
 * @returns {boolean} True if the ability should be suppressed, false otherwise.
 * @private
 */
export function _suppressed(abilityData) {
  let suppressed = false;
  if (!suppressed && abilityData.parent.isReference) {
    suppressed = true;
  }
  if (!suppressed && abilityData.parent.parent.type === "equipment") {
    if (!suppressed && !abilityData.parent.parent.system.equipped) {
      suppressed = true;
    }
    if (!suppressed && abilityData.parent.parent.system.dampened && abilityData.form !== "intrinsic") {
      suppressed = true;
    }
    if (!suppressed && abilityData.form !== "intrinsic") {
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
