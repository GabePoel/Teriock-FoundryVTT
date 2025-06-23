/** @import TeriockAbilityData from "../../ability-data.mjs" */

/**
 * Poor workaround to allow for children to be accessible for effect duplication.
 * @param {TeriockAbilityData} system
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(system) {
  const childUuids = [];
  if (system.childIds?.length > 0) {
    for (const id of system.childIds) {
      const child = system.parent.parent.getEmbeddedDocument("ActiveEffect", id);
      if (child) {
        childUuids.push(child.uuid);
      }
    }
  }
  if (childUuids.length > 0) {
    system.childUuids = childUuids;
  }
  let parentUuid = null;
  if (system.parentId) {
    const parent = system.parent.parent.getEmbeddedDocument("ActiveEffect", system.parentId);
    if (parent) {
      parentUuid = parent.uuid;
    }
    system.parentUuid = parentUuid;
  }
}
