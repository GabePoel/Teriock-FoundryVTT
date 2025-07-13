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

  const subUuids = [];
  if (abilityData.subIds?.length > 0) {
    for (const id of abilityData.subIds) {
      const sub = abilityData.parent.parent.getEmbeddedDocument("ActiveEffect", id);
      if (sub) {
        subUuids.push(sub.uuid);
      }
    }
  }
  if (subUuids.length > 0) {
    abilityData.subUuids = subUuids;
  }
  let supUuid = null;
  if (abilityData.supId) {
    const parent = abilityData.parent.parent.getEmbeddedDocument("ActiveEffect", abilityData.supId);
    if (parent) {
      supUuid = parent.uuid;
    }
    abilityData.supUuid = supUuid;
  }
}
