/** @import TeriockBaseActorData from "../../base-actor-data.mjs" */

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
export async function _takeAwaken(system) {
  if (system.parent.statuses.has("unconscious") && !system.parent.statuses.has("dead")) {
    if (system.hp.value <= 0) {
      await system.parent.update({ "system.hp.value": 1 });
    }
    if (system.parent.statuses.has("asleep")) {
      await system.parent.toggleStatusEffect("asleep", { active: false });
    }
    if (system.parent.statuses.has("unconscious")) {
      await system.parent.toggleStatusEffect("unconscious", { active: false });
    }
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
export async function _takeRevive(system) {
  if (system.parent.statuses.has("dead")) {
    if (system.hp.value <= 0) {
      await system.parent.update({ "system.hp.value": 1 });
    }
    await system.parent.toggleStatusEffect("dead", { active: false });
  }
}
