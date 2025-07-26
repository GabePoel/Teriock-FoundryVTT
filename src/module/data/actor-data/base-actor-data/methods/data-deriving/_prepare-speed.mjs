/**
 * Ensures all speed adjustments are non-negative and applies status-based modifiers.
 * Applies slowed and immobilized status effects to speed adjustments.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareSpeed(actorData) {
  if (
    actorData.speedAdjustments &&
    typeof actorData.speedAdjustments === "object"
  ) {
    for (const key of Object.keys(actorData.speedAdjustments)) {
      if (actorData.parent.statuses.has("slowed")) {
        actorData.speedAdjustments[key] -= 1;
      }
      if (actorData.parent.statuses.has("immobilized")) {
        actorData.speedAdjustments[key] = 0;
      }
      actorData.speedAdjustments[key] = Math.max(
        0,
        actorData.speedAdjustments[key],
      );
    }
  }
}
