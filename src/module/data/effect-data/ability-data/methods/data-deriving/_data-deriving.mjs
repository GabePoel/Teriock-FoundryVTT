/**
 * Poor workaround to allow for subs to be accessible for effect duplication.
 *
 * @param {TeriockAbilityData} abilityData
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(abilityData) {
  let applyChanges = abilityData.maneuver === "passive";
  for (const status of abilityData.duration.conditions.present) {
    if (!abilityData.actor?.statuses.has(status)) applyChanges = false;
  }
  for (const status of abilityData.duration.conditions.absent) {
    if (abilityData.actor?.statuses.has(status)) applyChanges = false;
  }
  if (applyChanges) {
    abilityData.parent.changes = abilityData.changes;
  }
  if (abilityData.parent.parent?.uuid) {
    abilityData.hierarchy.rootUuid = abilityData.parent.parent.uuid;
  }
}
