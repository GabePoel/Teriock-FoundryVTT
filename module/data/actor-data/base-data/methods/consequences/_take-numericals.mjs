/** @import TeriockBaseActorData from "../../base-data.mjs" */

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeDamage(system, amount) {
  const { hp } = system;
  const temp = Math.max(0, hp.temp - amount);
  amount = Math.max(0, amount - hp.temp);
  const value = Math.max(hp.min, hp.value - amount);
  await system.parent.update({ "system.hp.value": value, "system.hp.temp": temp });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeDrain(system, amount) {
  const { mp } = system;
  const temp = Math.max(0, mp.temp - amount);
  amount = Math.max(0, amount - mp.temp);
  const value = Math.max(mp.min, mp.value - amount);
  await system.parent.update({ "system.mp.value": value, "system.mp.temp": temp });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeWither(system, amount) {
  await system.parent.update({ "system.wither.value": Math.min(Math.max(0, system.wither.value + amount), 100) });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeHeal(system, amount) {
  const { hp } = system;
  const value = Math.min(hp.max, hp.value + amount);
  await system.parent.update({ "system.hp.value": value });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeRevitalize(system, amount) {
  const { mp } = system;
  const value = Math.min(mp.max, mp.value + amount);
  await system.parent.update({ "system.mp.value": value });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSetTempHp(system, amount) {
  await system.parent.update({ "system.hp.temp": amount });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSetTempMp(system, amount) {
  await system.parent.update({ "system.mp.temp": amount });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeGainTempHp(system, amount) {
  await system.parent.update({ "system.hp.temp": Math.max(system.hp.temp + amount, 0) });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeGainTempMp(system, amount) {
  await system.parent.update({ "system.mp.temp": Math.max(system.mp.temp + amount, 0) });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSleep(system, amount) {
  if (system.hp.value <= amount) {
    await system.parent.toggleStatusEffect("asleep", { active: true, overlay: true });
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeKill(system, amount) {
  if (system.hp.value <= amount) {
    const effectData = {
      name: "Forced Dead",
      statuses: ["dead", "down", "blind", "unconscious", "prone", "anosmatic", "mute"],
      type: "effect",
      img: "systems/teriock/assets/conditions/dead.svg",
      flags: {
        core: {
          overlay: true
        }
      }
    }
    await system.parent.createEmbeddedDocuments("ActiveEffect", [effectData])
    // await system.parent.toggleStatusEffect("dead");
  }
}
