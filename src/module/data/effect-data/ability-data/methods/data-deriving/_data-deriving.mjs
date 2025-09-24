/**
 * Poor workaround to allow for subs to be accessible for effect duplication.
 * @param {TeriockAbilityModel} abilityData
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(abilityData) {
  // Derived costs
  if (abilityData.invoked) {
    abilityData.costs.somatic = true;
    abilityData.costs.verbal = true;
  }

  // Gifted modifications
  if (abilityData.gifted.enabled) {
    abilityData.form = "gifted";
    if (abilityData.maneuver === "passive") {
      abilityData.maneuver = "active";
      abilityData.executionTime = "a1";
      abilityData.duration.unit = "minute";
      abilityData.duration.quantity = 1;
      abilityData.duration.description = "1 Minute";
    }
  }

  // Effect match power sources
  for (const ps of abilityData.powerSources) {
    if (
      Object.keys(TERIOCK.index.effectTypes).includes(ps) &&
      !abilityData.effectTypes.has(ps)
    ) {
      abilityData.effectTypes.add(ps);
    }
  }

  // Compute changes
  let applyChanges = abilityData.maneuver === "passive";
  for (const status of abilityData.duration.conditions.present) {
    if (!abilityData.actor?.statuses.has(status)) {
      applyChanges = false;
    }
  }
  for (const status of abilityData.duration.conditions.absent) {
    if (abilityData.actor?.statuses.has(status)) {
      applyChanges = false;
    }
  }
  if (applyChanges) {
    abilityData.parent.changes = abilityData.changes;
  }
}
