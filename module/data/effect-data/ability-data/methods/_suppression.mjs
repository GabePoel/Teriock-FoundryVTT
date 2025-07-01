/** @import TeriockAbilityData from "../ability-data.mjs"; */

/**
 * Checks if an ability should be suppressed based on various conditions.
 * Considers equipment state, attunement, and ancestor effect modifications.
 * @param {TeriockAbilityData} abilityData - The ability data to check for suppression.
 * @returns {boolean} True if the ability should be suppressed, false otherwise.
 * @private
 */
export function _suppressed(abilityData) {
  let suppressed = false;
  if (!suppressed && abilityData.parent.parent.type === "equipment") {
    if (!suppressed && !abilityData.parent.parent.system.equipped) {
      suppressed = true;
    }
    if (!suppressed && abilityData.parent.parent.system.dampened) {
      suppressed = true;
    }
    if (!suppressed && abilityData.abilityType !== "intrinsic") {
      const attuned = abilityData.parent.parent.system.attuned;
      suppressed = !attuned;
    }
  }
  if (!suppressed && abilityData.parent.getActor() && abilityData.parent.getParentSync()) {
    const ancestors = abilityData.parent.getAncestorsSync();
    if (ancestors.some((ancestor) => !ancestor.modifiesActor)) {
      suppressed = true;
    }
  }
  return suppressed;
}
