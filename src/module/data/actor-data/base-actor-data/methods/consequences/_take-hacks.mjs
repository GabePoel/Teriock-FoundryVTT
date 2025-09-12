import { hacks } from "../../../../../constants/data/_module.mjs";

/**
 * Increases the hack level for a specific body part and applies corresponding effects.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The body part to hack
 * @returns {Promise<void>} Resolves when the hack is applied and effects are updated
 *
 * @example
 * // Hack an actor's arm
 * await _takeHack(actor.system, "arm");
 *
 * @example
 * // Hack an actor's leg (will apply slowed status)
 * await _takeHack(actor.system, "leg");
 */
export async function _takeHack(actorData, part) {
  const actor = actorData.parent;
  const stat = actorData.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value + 1));
  const newStats = { ...actorData.hacks };
  newStats[part].value = value;
  await actor.update({ [`system.hacks.${part}.value`]: value });
  await updateHackStatus(actorData, newStats);
}

/**
 * Decreases the hack level for a specific body part and removes corresponding effects.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The body part to unhack
 * @returns {Promise<void>} Resolves when the unhack is applied and effects are updated
 *
 * @example
 * // Reduce an actor's arm hack
 * await _takeUnhack(actor.system, "arm");
 *
 * @example
 * // Reduce an actor's leg hack (may remove slowed status)
 * await _takeUnhack(actor.system, "leg");
 */
export async function _takeUnhack(actorData, part) {
  const actor = actorData.parent;
  const stat = actorData.hacks[part];
  const min = stat.min || 0;
  const max = stat.max || 2;
  const value = Math.min(max, Math.max(min, stat.value - 1));
  const newStats = { ...actorData.hacks };
  newStats[part].value = value;
  await actor.update({ [`system.hacks.${part}.value`]: value });
  await updateHackStatus(actorData, newStats);
}

/**
 * Updates the actor's ActiveEffects based on current hack levels for all body parts.
 *
 * This function analyzes the current hack values for all body parts and ensures that
 * the appropriate ActiveEffects are applied or removed. It compares the current hack
 * level against the maximum possible hack level for each part and manages the effects
 * accordingly.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @param {HackDataCollection} newStats - The updated hack statistics for all body parts
 * @returns {Promise<void>} Resolves when all hack effects are updated
 *
 * @example
 * // Update hack effects after modifying hack values
 * const updatedHacks = { ...system.hacks, arm: { ...system.hacks.arm, value: 2 } };
 * await updateHackStatus(system, updatedHacks);
 */
async function updateHackStatus(actorData, newStats) {
  const actor = actorData.parent;
  const hacksStats = newStats;
  for (const part in hacksStats) {
    const value = hacksStats[part].value || 0;
    const max = hacksStats[part].max || 2;
    const hackDataWanted = [];
    const hackDataUnwanted = [];
    for (let i = 1; i <= max; i++) {
      const hackData = hacks[part + i];
      if (value >= i && hackData) {
        hackDataWanted.push(hackData);
      } else if (value < i && hackData) {
        hackDataUnwanted.push(hackData);
      }
    }
    for (const wanted of hackDataWanted) {
      const effect = actor.effects.getName(wanted.name);
      if (!effect) {
        await actor.createEmbeddedDocuments("ActiveEffect", [ wanted ]);
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
