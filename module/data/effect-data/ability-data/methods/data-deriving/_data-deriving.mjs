/** @import TeriockAbilityData from "../../ability-data.mjs" */

/**
 * Poor workaround to allow for subs to be accessible for effect duplication.
 * @param {TeriockAbilityData} system
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(system) {
  const subUuids = [];
  if (system.subIds?.length > 0) {
    for (const id of system.subIds) {
      const sub = system.parent.parent.getEmbeddedDocument("ActiveEffect", id);
      if (sub) {
        subUuids.push(sub.uuid);
      }
    }
  }
  if (subUuids.length > 0) {
    system.subUuids = subUuids;
  }
  let supUuid = null;
  if (system.supId) {
    const parent = system.parent.parent.getEmbeddedDocument("ActiveEffect", system.supId);
    if (parent) {
      supUuid = parent.uuid;
    }
    system.supUuid = supUuid;
  }
}
