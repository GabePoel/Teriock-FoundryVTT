/**
 * Prepares defensive combat values for the actor.
 * Calculates block value, armor value, armor class, and combined class based on equipped equipment.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareDefenses(actorData) {
  const actor = actorData.parent;
  const equipment = actor.itemTypes.equipment;
  const equipped = equipment.filter((i) => i.system.isEquipped);
  const armor = equipped.filter((e) => e.system.equipmentClasses.has("armor"));
  if (armor.length > 0) {
    actorData.wornAc = Math.max(armor.map((e) => e.system.derivedAv));
  }

  // AV, BV, AC, CC
  actorData.bv = actorData.primaryBlocker?.system.derivedBv || 0;
  const av = Math.max(...equipped.map((item) => item.system.derivedAv || 0), actorData.naturalAv || 0);
  actorData.av = av;
  actorData.hasArmor = equipped.some((item) => Array.isArray(item.system.equipmentClasses)
    && item.system.equipmentClasses.has("armor"));
  let ac = 10 + av;
  if (actorData.hasArmor) {
    ac += actorData.wornAc || 0;
  }
  actorData.ac = ac;
  actorData.cc = ac + actorData.bv;
}
