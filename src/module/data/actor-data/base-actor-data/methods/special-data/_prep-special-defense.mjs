/**
 * Prepare derived dense.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepSpecialDefense(actorData) {
  const armor = actorData.parent.equipment.filter(
    (e) => e.system.isEquipped && e.system.equipmentClasses.has("armor"),
  );
  const naturalArmor = actorData.parent.bodyParts.filter(
    (a) => !a.disabled && a.system.av.value > 0,
  );
  if (armor.length > 0) {
    actorData.defense.av.worn = Math.max(armor.map((a) => a.system.av.value));
  }
  if (naturalArmor.length > 0) {
    actorData.defense.av.natural = Math.max(
      naturalArmor.map((a) => a.system.av.value),
    );
  }
  actorData.defense.av.value = Math.max(
    actorData.defense.av.natural,
    actorData.defense.av.worn,
  );
  actorData.defense.ac += actorData.defense.av.value;
  actorData.defense.bv = actorData.primaryBlocker?.system.bv.value || 0;
  actorData.defense.cc = actorData.defense.ac + actorData.defense.bv;
}
