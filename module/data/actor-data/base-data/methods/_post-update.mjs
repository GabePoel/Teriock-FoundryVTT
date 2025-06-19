/** @import TeriockBaseActorData from "../base-data.mjs"; */

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 * @private
 */
export async function _postUpdate(system) {
  await applyEncumbrance(system);
  await prepareTokens(system);
  await etherealKill(system);
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
async function applyEncumbrance(system) {
  const actor = system.parent;
  const level = system.encumbranceLevel || 0;
  const statuses = ["encumbered", "slowed", "immobilized"];
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const active = level > i;
    if (actor.statuses.has(status) !== active) {
      await actor.toggleStatusEffect(status, { active });
    }
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
async function prepareTokens(system) {
  const actor = system.parent;
  const tokens = actor?.getDependentTokens();
  const tokenSizes = {
    Tiny: 0.5,
    Small: 1,
    Medium: 1,
    Large: 2,
    Huge: 3,
    Gargantuan: 4,
    Colossal: 6,
  };
  for (const token of tokens) {
    const tokenSize = tokenSizes[system?.namedSize] || 1;
    const tokenParameters = {
      width: tokenSize,
      height: tokenSize,
    };
    await token.update(tokenParameters);
    await token.updateVisionMode(actor?.statuses?.has("ethereal") ? "ethereal" : "basic");
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
async function etherealKill(system) {
  const actor = system.parent;
  const down = actor?.statuses?.has("down");
  const ethereal = actor?.statuses?.has("ethereal");
  const dead = actor?.statuses?.has("dead");
  if (down && ethereal && !dead) {
    await actor.toggleStatusEffect("dead", { active: true });
    await actor.toggleStatusEffect("asleep", { active: false });
    await actor.toggleStatusEffect("unconscious", { active: false });
  }
}
