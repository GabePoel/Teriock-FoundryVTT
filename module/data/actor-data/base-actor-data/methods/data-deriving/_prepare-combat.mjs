/** @import TeriockBaseActorData from "../../base-actor-data.mjs" */

/**
 * Prepares defensive combat values for the actor.
 * Calculates block value, armor value, armor class, and combined class based on equipped equipment.
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareDefenses(system) {
  const actor = system.parent;
  const equipment = actor.itemTypes.equipment;
  const equipped = equipment.filter((i) => i.system.equipped);

  // Find and validate primary blocker
  const blocker = actor.items.get(system.wielding.blocker.raw);
  if (blocker?.system.equipped) {
    system.wielding.blocker.derived = blocker;
  } else {
    system.wielding.blocker.derived = null;
  }

  // AV, BV, AC, CC
  system.bv = system.wielding.blocker.derived?.system.bv || 0;
  const av = Math.max(...equipped.map((item) => item.system.av || 0), system.naturalAv || 0);
  system.av = av;
  system.hasArmor = equipped.some(
    (item) => Array.isArray(item.system.equipmentClasses) && item.system.equipmentClasses.includes("armor"),
  );
  let ac = 10 + av;
  if (system.hasArmor) ac += system.wornAc || 0;
  system.ac = ac;
  system.cc = ac + system.bv;
}

/**
 * Prepares offensive combat values for the actor.
 * Validates and sets the primary attacker equipment.
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareOffenses(system) {
  const actor = system.parent;
  const attacker = actor.items.get(system.wielding.attacker.raw);
  if (attacker?.system.equipped) {
    system.wielding.attacker.derived = attacker;
  } else {
    system.wielding.attacker.derived = null;
  }
}
