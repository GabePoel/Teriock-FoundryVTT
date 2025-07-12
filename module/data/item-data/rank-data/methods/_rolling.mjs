import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * Rolls a resource die (hit or mana) for a rank and updates the actor's resources.
 * Handles die rolling, message creation, and resource updates.
 * @param {string} type - The type of die to roll ("hit" or "mana").
 * @param {TeriockItem} rank - The rank item to roll the die for.
 * @returns {Promise<void>} Promise that resolves when the die roll is complete.
 * @private
 */
async function rollResourceDie(type, rank) {
  const dieKey = type === "hit" ? "hitDie" : "manaDie";
  const spentKey = type === "hit" ? "hitDieSpent" : "manaDieSpent";
  const resourceKey = type === "hit" ? "hp" : "mp";
  if (rank.system[spentKey]) return;

  const die = rank.system[dieKey];
  const roll = new TeriockRoll(die, rank.actor.getRollData());
  await roll.evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: rank.actor }),
    flavor: `${type === "hit" ? "Hit" : "Mana"} Die`,
    rollMode: game.settings.get("core", "rollMode"),
    create: true,
  });
  await rank.update({ [`system.${spentKey}`]: true });
  await rank.actor.update({
    [`system.${resourceKey}.value`]: Math.min(
      rank.actor.system[resourceKey].max,
      rank.actor.system[resourceKey].value + roll.total,
    ),
  });
}

/**
 * Rolls the hit die for a rank and updates the actor's HP.
 * @param {TeriockRank} rank - The rank item to roll the hit die for.
 * @returns {Promise<void>} Promise that resolves when the hit die roll is complete.
 * @private
 */
export async function _rollHitDie(rank) {
  return rollResourceDie("hit", rank);
}

/**
 * Rolls the mana die for a rank and updates the actor's MP.
 * @param {TeriockRank} rank - The rank item to roll the mana die for.
 * @returns {Promise<void>} Promise that resolves when the mana die roll is complete.
 * @private
 */
export async function _rollManaDie(rank) {
  return rollResourceDie("mana", rank);
}
