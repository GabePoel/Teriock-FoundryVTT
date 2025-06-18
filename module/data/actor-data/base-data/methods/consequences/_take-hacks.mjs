/** @typedef {import("../../base-data.mjs").default} TeriockBaseActorData */
/** @typedef {InstanceType<import("../../../../../documents/_module.mjs").TeriockActor>} TeriockActor */

/**
 * @param {TeriockBaseActorData} system
 * @param {string} part
 * @returns {Promise<void>}
 */
export async function _takeHack(system, part) {
  const actor = system.parent;
  const stat = system.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value + 1));
  await actor.update({ [`system.hacks.${part}.value`]: value });
  const hacksTotal = Object.values(system.hacks).reduce((sum, hack) => sum + (hack.value || 0), 0);
  if (hacksTotal > 0) {
    await actor.toggleStatusEffect('hacked', { active: true });
    if (part === 'ear') {
      await actor.toggleStatusEffect('deaf', { active: true });
    } else if (part === 'eye') {
      await actor.toggleStatusEffect('blind', { active: true });
    } else if (part === 'nose') {
      await actor.toggleStatusEffect('anosmatic', { active: true });
    } else if (part === 'mouth') {
      await actor.toggleStatusEffect('mute', { active: true });
    } else if (part === 'body') {
      await actor.toggleStatusEffect('immobilized', { active: true });
    } else if (part === 'leg') {
      if (value >= 1) {
        await actor.toggleStatusEffect('slowed', { active: true });
      }
      if (value >= 2) {
        await actor.toggleStatusEffect('immobilized', { active: true });
      }
    }
  }
}

/**
 * @param {TeriockBaseActorData} system
 * @param {string} part
 * @returns {Promise<void>}
 */
export async function _takeUnhack(system, part) {
  const actor = system.parent;
  const stat = system.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value - 1));
  await actor.update({ [`system.hacks.${part}.value`]: value });
  const hacksTotal = Object.values(system.hacks).reduce((sum, hack) => sum + (hack.value || 0), 0);
  if (hacksTotal === 0) {
    await actor.toggleStatusEffect('hacked', { active: false });
  }
}