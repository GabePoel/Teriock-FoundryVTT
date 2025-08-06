/**
 * Generic sorting function for embedded items with customizable accessors.
 * Sorts items based on a sort key and direction, using custom accessor functions.
 * @param {TeriockAbility[]|TeriockEquipment[]} items - Array of items to sort.
 * @param {string} sortKey - The key to sort by.
 * @param {boolean} ascending - Whether to sort in ascending order.
 * @param {Record<string, *>} sortMap - Map of sort keys to accessor functions.
 * @returns {TeriockAbility[]|TeriockEquipment[]} Sorted array of items.
 */
export function _sortEmbedded(items, sortKey, ascending, sortMap = {}) {
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
  return ascending ? sorted : sorted.reverse();
}

/**
 * Sorts abilities based on actor sheet settings.
 * Uses the actor's ability sort configuration to determine sort criteria.
 * @param {TeriockActor} actor - The actor whose abilities to sort.
 * @returns {TeriockAbility[]} Sorted array of abilities.
 */
export function _sortAbilities(actor) {
  /** @type {TeriockBaseActorSheet} */
  const sheet = actor.sheet;
  const abilities = actor.abilities;
  const sortKey = sheet.settings.abilitySortOption;
  const ascending = sheet.settings.abilitySortAscending;
  /** @type {Record<string, *>} */
  const sortMap = {
    /** @param {TeriockAbility} a */
    name: (a) => a.name,
    /** @param {TeriockAbility} a */
    sourceName: (a) => a.parent?.name ?? "",
    /** @param {TeriockAbility} a */
    sourceType: (a) => a.parent?.type ?? "",
    /** @param {TeriockAbility} a */
    enabled: (a) => Number(a.disabled),
    /** @param {TeriockAbility} a */
    type: (a) => a.system.form ?? "",
  };
  return _sortEmbedded(abilities, sortKey, ascending, sortMap);
}

/**
 * Sorts equipment based on actor sheet settings.
 * Uses the actor's equipment sort configuration to determine sort criteria.
 * @param {TeriockActor} actor - The actor whose equipment to sort.
 * @returns {TeriockEquipment[]} Sorted array of equipment.
 */
export function _sortEquipment(actor) {
  /** @type {TeriockBaseActorSheet} */
  const sheet = actor.sheet;
  const equipment = actor.itemTypes.equipment;
  const sortKey = sheet.settings.equipmentSortOption;
  const ascending = sheet.settings.equipmentSortAscending;
  /** {Record<string, *>} */
  const sortMap = {
    /** @param {TeriockEquipment} e */
    name: (e) => e.name,
    /** @param {TeriockEquipment} e */
    av: (e) => e.system.av ?? 0,
    /** @param {TeriockEquipment} e */
    bv: (e) => e.system.bv ?? 0,
    /** @param {TeriockEquipment} e */
    consumable: (e) => Number(e.system.consumable),
    /** @param {TeriockEquipment} e */
    damage: (e) => e.system.damage ?? 0,
    /** @param {TeriockEquipment} e */
    identified: (e) => Number(e.system.identified),
    /** @param {TeriockEquipment} e */
    equipmentType: (e) => e.system.equipmentType ?? "",
    /** @param {TeriockEquipment} e */
    equipped: (e) => Number(e.system.equipped),
    /** @param {TeriockEquipment} e */
    minStr: (e) => e.system.minStr ?? 0,
    /** @param {TeriockEquipment} e */
    powerLevel: (e) => e.system.powerLevel ?? 0,
    /** @param {TeriockEquipment} e */
    shattered: (e) => Number(e.system.shattered),
    /** @param {TeriockEquipment} e */
    tier: (e) => e.system.tier.derived ?? 0,
    /** @param {TeriockEquipment} e */
    weight: (e) => e.system.weight ?? 0,
  };
  return _sortEmbedded(equipment, sortKey, ascending, sortMap);
}
