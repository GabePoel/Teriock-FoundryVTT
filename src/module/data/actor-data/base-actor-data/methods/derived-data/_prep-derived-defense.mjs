/**
 * Prepare derived dense.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepDerivedDefense(actorData) {
  const armor = actorData.parent.equipment.filter(
    (e) => e.system.isEquipped && e.system.equipmentClasses.has("armor"),
  );
  if (armor.length > 0) {
    actorData.defense.av.worn = Math.max(armor.map((a) => a.system.av.value));
  }
  actorData.defense.av.value = Math.max(
    actorData.defense.av.natural,
    actorData.defense.av.worn,
  );
  actorData.defense.ac = 10 + actorData.defense.av.value;
  actorData.defense.bv = actorData.primaryBlocker?.system.bv.value || 0;
  actorData.defense.cc = actorData.defense.ac + actorData.defense.bv;
}
