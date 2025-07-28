import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * Rolls a resource die (hit or mana) for a rank and updates the actor's resources.
 * Handles die rolling, message creation, and resource updates.
 *
 * @param {string} type - The type of die to roll ("hit" or "mana").
 * @param {TeriockRankData} rankData - The rank item to roll the die for.
 * @returns {Promise<void>} Promise that resolves when the die roll is complete.
 * @private
 */
async function rollResourceDie(type, rankData) {
  const dieKey = type === "hit" ? "hitDie" : "manaDie";
  const spentKey = type === "hit" ? "hitDieSpent" : "manaDieSpent";
  const resourceKey = type === "hit" ? "hp" : "mp";
  if (rankData[spentKey]) return;

  const die = rankData[dieKey];
  const roll = new TeriockRoll(die, rankData.actor.getRollData());
  await roll.evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: rankData.actor }),
    flavor: `${type === "hit" ? "Hit" : "Mana"} Die`,
    rollMode: game.settings.get("core", "rollMode"),
    create: true,
  });
  await rankData.parent.update({ [`system.${spentKey}`]: true });
  await rankData.actor.update({
    [`system.${resourceKey}.value`]: Math.min(
      rankData.actor.system[resourceKey].max,
      rankData.actor.system[resourceKey].value + roll.total,
    ),
  });
}

/**
 * Rolls the hit die for a rank and updates the actor's HP.
 *
 * @param {TeriockRankData} rankData - The rank item to roll the hit die for.
 * @returns {Promise<void>} Promise that resolves when the hit die roll is complete.
 * @private
 */
export async function _rollHitDie(rankData) {
  return rollResourceDie("hit", rankData);
}

/**
 * Rolls the mana die for a rank and updates the actor's MP.
 *
 * @param {TeriockRankData} rankData - The rank item to roll the mana die for.
 * @returns {Promise<void>} Promise that resolves when the mana die roll is complete.
 * @private
 */
export async function _rollManaDie(rankData) {
  return rollResourceDie("mana", rankData);
}
