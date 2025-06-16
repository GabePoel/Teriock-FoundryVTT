export function _prepareDefenses(actor) {
  const sheet = actor.system.sheet;
  const equipment = actor.itemTypes.equipment;
  // Find and validate primary blocker
  if (sheet.primaryBlocker) {
    const blocker = equipment.find(i => i._id === sheet.primaryBlocker && i.system.equipped);
    actor.system.primaryBlocker = blocker || null;
  }
  // Block value
  actor.system.bv = actor.system.primaryBlocker?.system.bv || 0;
  // Armor value
  const equipped = equipment.filter(i => i.system.equipped);
  const av = Math.max(
    ...equipped.map(item => item.system.av || 0),
    actor.system.naturalAv || 0
  );
  actor.system.av = av;
  // Armor check
  actor.system.hasArmor = equipped.some(item =>
    Array.isArray(item.system.equipmentClasses) &&
    item.system.equipmentClasses.includes("armor")
  );
  // AC calculation
  let ac = 10 + av;
  if (actor.system.hasArmor) ac += actor.system.wornAc || 0;
  actor.system.ac = ac;
  actor.system.cc = ac + actor.system.bv;
}

export function _prepareOffenses(actor) {
  if (actor.system.sheet.primaryAttacker) {
    actor.system.primaryAttacker = actor.itemTypes.equipment.find(i => i._id === actor.system.sheet.primaryAttacker);
    if (!actor.system.primaryAttacker || !actor.system.primaryAttacker.system.equipped) {
      actor.system.sheet.primaryAttacker = null;
    }
  }
}