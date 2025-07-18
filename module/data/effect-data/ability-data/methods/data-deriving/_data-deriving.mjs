/**
 * Poor workaround to allow for subs to be accessible for effect duplication.
 *
 * @param {TeriockAbilityData} abilityData
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(abilityData) {
  if (abilityData.maneuver === "passive") {
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
    abilityData.rootUuid = abilityData.parent.parent.uuid;
  }
}
