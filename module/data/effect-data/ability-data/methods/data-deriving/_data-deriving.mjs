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
    if (!abilityData.actor.statuses.has(status)) applyChanges = false;
  }
  for (const status of abilityData.duration.conditions.absent) {
    if (abilityData.actor.statuses.has(status)) applyChanges = false;
  }
  if (applyChanges) {
    if (abilityData.applies.base.changes.length > 0) {
      abilityData.parent.changes = /** @type {EffectChangeData[]} */ abilityData.applies.base.changes;
    }
    if (abilityData.parent.isProficient && abilityData.applies.proficient.changes.length > 0) {
      abilityData.parent.changes = /** @type {EffectChangeData[]} */ abilityData.applies.proficient.changes;
    }
    if (abilityData.parent.isFluent && abilityData.applies.fluent.changes.length > 0) {
      abilityData.parent.changes = /** @type {EffectChangeData[]} */ abilityData.applies.fluent.changes;
    }
  }
  if (abilityData.parent.parent?.uuid) {
    abilityData.hierarchy.rootUuid = abilityData.parent.parent.uuid;
  }
}
