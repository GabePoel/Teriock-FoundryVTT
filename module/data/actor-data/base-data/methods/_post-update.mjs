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
  await checkExpirations(system);
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
    if (token.width !== tokenSize || token.height !== tokenSize) {
      await token.update(tokenParameters);
    }
    const newVisionMode = actor?.statuses?.has("ethereal") ? "ethereal" : "basic";
    if (token.sight.visionMode !== newVisionMode) {
      await token.updateVisionMode(newVisionMode);
    }
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
  console.log("Ethereal kill check", { down, ethereal, dead });
  if (down && ethereal && !dead) {
    await actor.toggleStatusEffect("dead", { active: true });
    await actor.toggleStatusEffect("asleep", { active: false });
    await actor.toggleStatusEffect("unconscious", { active: false });
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {Promise<void>}
 */
async function checkExpirations(system) {
  const actor = system.parent;
  actor.conditionExpirationEffects.forEach(async (effect) => {
    console.log("Checking condition expiration effect", effect);
    await effect.system.checkExpiration();
  });
}
