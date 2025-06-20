/** @import TeriockBaseActorData from "../../base-data.mjs" */
import { hacksData } from "../../../../../content/hacks.mjs";

/**
 * @param {TeriockBaseActorData} system
 * @param {string} part
 * @returns {Promise<void>}
 * @private
 */
export async function _takeHack(system, part) {
  const actor = system.parent;
  const stat = system.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value + 1));
  console.log(`Taking hack on ${part}:`, value);
  console.log(system.hacks);
  const newStats = { ...system.hacks };
  newStats[part].value = value;
  await actor.update({ [`system.hacks.${part}.value`]: value });
  await updateHackStatus(system, newStats);
}

/**
 * @param {TeriockBaseActorData} system
 * @param {string} part
 * @returns {Promise<void>}
 * @private
 */
export async function _takeUnhack(system, part) {
  const actor = system.parent;
  const stat = system.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value - 1));
  const newStats = { ...system.hacks };
  newStats[part].value = value;
  await actor.update({ [`system.hacks.${part}.value`]: value });
  await updateHackStatus(system, newStats);
}

/**
 * @param {TeriockBaseActorData} system
 * @param {object} newStats
 */
async function updateHackStatus(system, newStats) {
  const actor = system.parent;
  const hacks = newStats;
  for (const part in hacks) {
    const value = hacks[part].value || 0;
    const max = hacks[part].max || 2;
    const relevantHackData = [];
    const hackDataWanted = [];
    const hackDataUnwanted = [];
    for (let i = 1; i <= max; i++) {
      const hackData = hacksData[part + i];
      if (value >= i && hackData) {
        relevantHackData.push(hackData);
        hackDataWanted.push(hackData);
      } else if (value < i && hackData) {
        hackDataUnwanted.push(hackData);
      }
    }
    for (const wanted of hackDataWanted) {
      const effect = actor.effects.getName(wanted.name);
      if (!effect) {
        await actor.createEmbeddedDocuments("ActiveEffect", [wanted]);
      }
    }
    for (const unwanted of hackDataUnwanted) {
      const effect = actor.effects.getName(unwanted.name);
      if (effect) {
        await effect.delete();
      }
    }
  }
}
