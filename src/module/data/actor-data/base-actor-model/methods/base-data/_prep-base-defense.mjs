/**
 * Prepare base defense.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseDefense(actorData) {
  const armor = actorData.parent.equipment.filter(
    (e) => e.system.isEquipped && e.system.equipmentClasses.has("armor"),
  );
  const baseAv = Math.max(armor.map((a) => a.system.av.value));
  actorData.defense = {
    av: {
      base: baseAv,
      natural: 0,
      value: 0,
      worn: 0,
    },
    ac: 10,
    bv: 0,
    cc: 10,
  };
}
