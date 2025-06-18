/** @typedef {import("../../base-data.mjs").default} TeriockBaseActorData */
/** @typedef {import("../../../../../documents/actor.mjs").default} TeriockActor */

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
  await system.parent.update({ 'system.hp.value': value, 'system.hp.temp': temp });
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
  await system.parent.update({ 'system.mp.value': value, 'system.mp.temp': temp });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeHeal(system, amount) {
  const { hp } = system;
  const value = Math.min(hp.max, hp.value + amount);
  await system.parent.update({ 'system.hp.value': value });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeRevitalize(system, amount) {
  const { mp } = system;
  const value = Math.min(mp.max, mp.value + amount);
  await system.parent.update({ 'system.mp.value': value });
}

/**
 * @param {TeriockBaseActorData} system
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeWither(system, amount) {
  await system.parent.update({ 'system.wither.value': Math.min(Math.max(0, system.wither.value + amount), 100) });
}