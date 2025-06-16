import TeriockRoll from "../../../documents/roll.mjs";

async function rollResourceDie(type, rank) {
  const dieKey = type === 'hit' ? 'hitDie' : 'manaDie';
  const spentKey = type === 'hit' ? 'hitDieSpent' : 'manaDieSpent';
  const resourceKey = type === 'hit' ? 'hp' : 'mp';
  if (rank.system[spentKey]) return;

  const die = rank.system[dieKey];
  const roll = new TeriockRoll(die);
  await roll.evaluate({ async: true });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: rank.actor }),
    flavor: `${type === 'hit' ? 'Hit' : 'Mana'} Die`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rollMode: game.settings.get("core", "rollMode"),
    create: true,
  });
  await rank.update({ [`system.${spentKey}`]: true });
  await rank.actor.update({
    [`system.${resourceKey}.value`]: Math.min(
      rank.actor.system[resourceKey].max,
      rank.actor.system[resourceKey].value + roll.total
    ),
  });
}

export async function _rollHitDie(rank) {
  return rollResourceDie('hit', rank);
}

export async function _rollManaDie(rank) {
  return rollResourceDie('mana', rank);
}