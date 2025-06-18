/** @import TeriockActor from "../../../../documents/_module.mjs"; */

/**
 * @param {TeriockActor} actor 
 */
export async function _postUpdate(actor) {
  await applyEncumbrance(actor);
  await prepareTokens(actor);
  await etherealKill(actor);
}

/**
 * @param {TeriockActor} actor 
 */
async function applyEncumbrance(actor) {
  const level = actor.system.encumbranceLevel || 0;
  const statuses = ['encumbered', 'slowed', 'immobilized'];
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const active = level > i;
    if (actor.statuses.has(status) !== active) {
      await actor.toggleStatusEffect(status, { active });
    }
  }
}

/**
 * @param {TeriockActor} actor
 */
async function prepareTokens(actor) {
  const tokens = actor?.getDependentTokens();
  const tokenSizes = {
    'Tiny': 0.5,
    'Small': 1,
    'Medium': 1,
    'Large': 2,
    'Huge': 3,
    'Gargantuan': 4,
    'Colossal': 6,
  }
  for (const token of tokens) {
    const tokenSize = tokenSizes[actor?.system?.namedSize] || 1;
    const tokenParameters = {
      'width': tokenSize,
      'height': tokenSize,
    }
    await token.update(tokenParameters)
    await token.updateVisionMode(actor?.statuses?.has('ethereal') ? 'ethereal' : 'basic');
  }
}

/**
 * @param {TeriockActor} actor
 */
async function etherealKill(actor) {
  const down = actor?.statuses?.has('down');
  const ethereal = actor?.statuses?.has('ethereal');
  const dead = actor?.statuses?.has('dead');
  if (down && ethereal && !dead) {
    await actor.toggleStatusEffect('dead', { active: true });
    await actor.toggleStatusEffect('asleep', { active: false });
    await actor.toggleStatusEffect('unconscious', { active: false });
  }
}