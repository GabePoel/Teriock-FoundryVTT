/** @import TeriockAbilityData from "../ability-data.mjs"; */

/**
 * @param {TeriockAbilityData} abilityData
 * @returns {boolean}
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
