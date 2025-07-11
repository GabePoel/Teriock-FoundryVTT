/** @import TeriockBaseActorData from "../../base-actor-data.mjs"; */

/**
 * Ensures all speed adjustments are non-negative and applies status-based modifiers.
 * Applies slowed and immobilized status effects to speed adjustments.
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareSpeed(system) {
  if (system.speedAdjustments && typeof system.speedAdjustments === "object") {
    for (const key of Object.keys(system.speedAdjustments)) {
      if (system.parent.statuses.has("slowed")) {
        system.speedAdjustments[key] -= 1;
      }
      if (system.parent.statuses.has("immobilized")) {
        system.speedAdjustments[key] = 0;
      }
      system.speedAdjustments[key] = Math.max(0, system.speedAdjustments[key]);
    }
  }
}
