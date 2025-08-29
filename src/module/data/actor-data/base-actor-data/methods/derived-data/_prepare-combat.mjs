/**
 * Prepares defensive combat values for the actor.
 * Calculates block value, armor value, armor class, and combined class based on equipped equipment.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareDefenses(actorData) {
  const actor = actorData.parent;
  const equipment = actor.itemTypes.equipment;
  const equipped = equipment.filter((i) => i.system.isEquipped);

  // Find and validate primary blocker

  const blocker = actor.items.get(actorData.wielding.blocker.raw);
  if (blocker?.system.isEquipped) {
    actorData.wielding.blocker.derived = blocker;
  } else {
    actorData.wielding.blocker.derived = null;
  }

  // AV, BV, AC, CC

  actorData.bv = actorData.wielding.blocker.derived?.system.derivedBv || 0;
  const av = Math.max(
    ...equipped.map((item) => item.system.derivedAv || 0),
    actorData.naturalAv || 0,
  );
  actorData.av = av;
  actorData.hasArmor = equipped.some(
    (item) =>
      Array.isArray(item.system.equipmentClasses) &&
      item.system.equipmentClasses.has("armor"),
  );
  let ac = 10 + av;
  if (actorData.hasArmor) ac += actorData.wornAc || 0;
  actorData.ac = ac;
  actorData.cc = ac + actorData.bv;
}

/**
 * Prepares offensive combat values for the actor.
 * Validates and sets the primary attacker equipment.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareOffenses(actorData) {
  const actor = actorData.parent;
  const attacker = actor.items.get(actorData.wielding.attacker.raw);
  if (attacker?.system.isEquipped) {
    actorData.wielding.attacker.derived = attacker;
  } else {
    actorData.wielding.attacker.derived = null;
  }
}
