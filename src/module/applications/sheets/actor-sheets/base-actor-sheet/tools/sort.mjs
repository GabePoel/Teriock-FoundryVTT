/**
 * Generic sorting function for embedded items with customizable accessors.
 * Sorts items based on a sort key and direction, using custom accessor functions.
 * @param {TeriockAbility[]|TeriockEquipment[]} items - Array of items to sort.
 * @param {string} sortKey - The key to sort by.
 * @param {boolean} ascending - Whether to sort in ascending order.
 * @param {Record<string, *>} sortMap - Map of sort keys to accessor functions.
 * @returns {TeriockAbility[]|TeriockEquipment[]} A sorted array of items.
 */
function sortEmbedded(items, sortKey, ascending, sortMap = {}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }
  const accessor = sortMap[sortKey] ?? ((i) => i.name ?? "");
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aVal = accessor(a) ?? "";
    const bVal = accessor(b) ?? "";
    return typeof aVal === "number" ? aVal - bVal : aVal.localeCompare(bVal);
  });
  return ascending ? sorted : sorted.reverse() || [];
}

/**
 * Sorts abilities based on actor sheet settings.
 * Uses the actor's ability sorting configuration to determine sort criteria.
 * @param {TeriockActor} actor - The actor whose abilities should be sorted.
 * @param {TeriockAbility[]} abilities
 * @returns {TeriockAbility[]} A sorted array of abilities.
 */
export function sortAbilities(actor, abilities) {
  const sheet = actor.sheet;
  const sortKey = sheet.settings.abilitySortOption;
  const ascending = sheet.settings.abilitySortAscending;
  /** @type {Record<string, Teriock.Sheet.AbilitySorter>} */
  const sortMap = {
    name: (a) => a.name,
    sourceName: (a) => a.parent?.name ?? "",
    sourceType: (a) => a.parent?.type ?? "",
    enabled: (a) => Number(a.disabled),
    type: (a) => a.system.form ?? "",
  };
  return sortEmbedded(abilities, sortKey, ascending, sortMap) || [];
}

/**
 * Sorts equipment based on actor sheet settings.
 * Uses the actor's equipment sort configuration to determine sort criteria.
 * @param {TeriockActor} actor - The actor whose equipment should be sorted.
 * @param {TeriockEquipment[]} equipment
 * @returns {TeriockEquipment[]} Sorted array of equipment.
 */
export function sortEquipment(actor, equipment) {
  const sheet = actor.sheet;
  const sortKey = sheet.settings.equipmentSortOption;
  const ascending = sheet.settings.equipmentSortAscending;
  /** @type {Record<string, Teriock.Sheet.EquipmentSorter>} */
  const sortMap = {
    name: (e) => e.name,
    av: (e) => e.system.av.value ?? 0,
    bv: (e) => e.system.bv.value ?? 0,
    consumable: (e) => Number(e.system.consumable),
    damage: (e) => e.system.damage.base.currentValue ?? 0,
    identified: (e) => Number(e.system.identified),
    equipmentType: (e) => e.system.equipmentType ?? "",
    equipped: (e) => Number(e.system.equipped),
    minStr: (e) => e.system.minStr.value ?? 0,
    powerLevel: (e) => e.system.powerLevel ?? 0,
    shattered: (e) => Number(e.system.shattered),
    tier: (e) => e.system.tier.value ?? 0,
    weight: (e) => e.system.weight.value ?? 0,
  };
  return sortEmbedded(equipment, sortKey, ascending, sortMap);
}
