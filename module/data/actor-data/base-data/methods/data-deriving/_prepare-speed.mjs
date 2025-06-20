/** @import TeriockBaseActorData from "../../base-data.mjs"; */

/**
 * Ensure all speed adjustments are non-negative.
 * @param {TeriockBaseActorData} system
 */
export function _prepareSpeed(system) {
  if (system.speedAdjustments && typeof system.speedAdjustments === "object") {
    for (const key of Object.keys(system.speedAdjustments)) {
      system.speedAdjustments[key] = Math.max(0, system.speedAdjustments[key]);
    }
  }
}
