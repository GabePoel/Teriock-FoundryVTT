export function _sortEmbedded(items, sortKey, ascending, accessorMap = {}) {
  const accessor = accessorMap[sortKey] ?? (i => i.name ?? '');
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aVal = accessor(a) ?? '';
    const bVal = accessor(b) ?? '';
    return typeof aVal === 'number' ? aVal - bVal : aVal.localeCompare(bVal);
  });
  return ascending ? sorted : sorted.reverse();
}

export function _sortAbilities(actor) {
  const abilities = actor.effectTypes.ability;
  const sortKey = actor.system.sheet.abilitySortOption;
  const ascending = actor.system.sheet.abilitySortAscending;
  const sortMap = {
    name: i => i.name,
    sourceName: i => i.parent?.name ?? '',
    sourceType: i => i.parent?.type ?? '',
    enabled: i => Number(i.disabled),
    type: i => i.system.abilityType ?? '',
  };
  return _sortEmbedded(abilities, sortKey, ascending, sortMap);
}

export function _sortEquipment(actor) {
  const equipment = actor.itemTypes.equipment;
  const sortKey = actor.system.sheet.equipmentSortOption;
  const ascending = actor.system.sheet.equipmentSortAscending;
  const sortMap = {
    name: i => i.name,
    av: i => i.system.av ?? 0,
    bv: i => i.system.bv ?? 0,
    consumable: i => Number(i.system.consumable),
    damage: i => i.system.damage ?? 0,
    identified: i => Number(i.system.identified),
    equipmentType: i => i.system.equipmentType ?? '',
    equipped: i => Number(i.system.equipped),
    minStr: i => i.system.minStr ?? 0,
    powerLevel: i => i.system.powerLevel ?? 0,
    shattered: i => Number(i.system.shattered),
    tier: i => i.system.tier ?? 0,
    weight: i => i.system.weight ?? 0,
  };
  return _sortEmbedded(equipment, sortKey, ascending, sortMap);
}
