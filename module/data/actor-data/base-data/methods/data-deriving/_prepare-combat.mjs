/** @import TeriockBaseActorData from "../../base-data.mjs" */

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 */
export function _prepareDefenses(system) {
  const actor = system.parent;
  const sheet = system.sheet;
  const equipment = actor.itemTypes.equipment;
  // Find and validate primary blocker
  if (sheet.primaryBlocker) {
    const blocker = equipment.find((i) => i._id === sheet.primaryBlocker && i.system.equipped);
    system.primaryBlocker = blocker || null;
  }
  // Block value
  system.bv = system.primaryBlocker?.system.bv || 0;
  // Armor value
  const equipped = equipment.filter((i) => i.system.equipped);
  const av = Math.max(...equipped.map((item) => item.system.av || 0), system.naturalAv || 0);
  system.av = av;
  // Armor check
  system.hasArmor = equipped.some(
    (item) => Array.isArray(item.system.equipmentClasses) && item.system.equipmentClasses.includes("armor"),
  );
  // AC calculation
  let ac = 10 + av;
  if (system.hasArmor) ac += system.wornAc || 0;
  system.ac = ac;
  system.cc = ac + system.bv;
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 */
export function _prepareOffenses(system) {
  const actor = system.parent;
  if (system.sheet.primaryAttacker) {
    system.primaryAttacker = actor.itemTypes.equipment.find((i) => i._id === system.sheet.primaryAttacker);
    if (!system.primaryAttacker || !system.primaryAttacker.system.equipped) {
      system.sheet.primaryAttacker = null;
    }
  }
}
