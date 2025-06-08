export function filterAbilities(actor) {
  let abilities = actor.effectTypes.ability;
  const filters = actor.system.sheet.abilityFilters || {};
  const sortKey = actor.system.sheet.abilitySortOption;
  const ascending = actor.system.sheet.abilitySortAscending;

  const sortMap = {
    name: i => i.name,
    sourceName: i => i.parent?.name ?? '',
    sourceType: i => i.parent?.type ?? '',
    enabled: i => Number(i.disabled),
    type: i => i.system.abilityType ?? '',
  };

  abilities = _sortItems(abilities, sortKey, ascending, sortMap[sortKey]) || [];

  return abilities.filter(i =>
    (!filters.basic || i.system.basic) &&
    (!filters.standard || i.system.standard) &&
    (!filters.skill || i.system.skill) &&
    (!filters.spell || i.system.spell) &&
    (!filters.ritual || i.system.ritual) &&
    (!filters.rotator || i.system.rotator) &&
    (!filters.sustained || i.system.sustained) &&
    (!filters.heightened || i.system.heightened) &&
    (!filters.expansion || i.system.expansion) &&
    (!filters.verbal || i.system.costs.verbal) &&
    (!filters.somatic || i.system.costs.somatic) &&
    (!filters.material || i.system.costs.material) &&
    (!filters.invoked || i.system.costs.invoked) &&
    (!filters.hp || i.system.costs.hp) &&
    (!filters.mp || i.system.costs.mp) &&
    (!filters.broken || i.system.break) &&
    (!filters.maneuver || i.system.maneuver === filters.maneuver) &&
    (!filters.interaction || i.system.interaction === filters.interaction) &&
    (!filters.delivery || i.system.delivery.base === filters.delivery) &&
    (!filters.target || (i.system.targets || []).includes(filters.target)) &&
    (!filters.powerSource || (i.system.powerSources || []).includes(filters.powerSource)) &&
    (!filters.element || (i.system.elements || []).includes(filters.element)) &&
    (!filters.effects || filters.effects.every(e => i.system.effects.includes(e)))
  );
}

export function filterEquipment(actor) {
  let equipment = actor.itemTypes.equipment;
  const filters = actor.system.sheet.equipmentFilters || {};
  const sortKey = actor.system.sheet.equipmentSortOption;
  const ascending = actor.system.sheet.equipmentSortAscending;

  const sortMap = {
    name: i => i.name,
    av: i => i.system.av ?? 0,
    bv: i => i.system.bv ?? 0,
    consumable: i => Number(i.system.consumable),
    damage: i => i.system.damage ?? 0,
    dampened: i => Number(i.system.dampened),
    equipmentType: i => i.system.equipmentType ?? '',
    equipped: i => Number(i.system.equipped),
    minStr: i => i.system.minStr ?? 0,
    powerLevel: i => i.system.powerLevel ?? 0,
    shattered: i => Number(i.system.shattered),
    tier: i => i.system.tier ?? 0,
    weight: i => i.system.weight ?? 0,
  };

  equipment = _sortItems(equipment, sortKey, ascending, sortMap[sortKey]) || [];

  return equipment.filter(i => {
    const equipmentClass = (i.system.equipmentClass ?? '').toLowerCase();
    const filterEquipmentClass = (filters.equipmentClasses ?? '').toLowerCase();
    const properties = (i.system.properties || []).map(p => (p ?? '').toLowerCase());
    const filterProperty = (filters.properties ?? '').toLowerCase();
    const transferredEffects = (i.transferredEffects || []).map(eff => (eff.name ?? '').toLowerCase());
    const materialProperties = (i.system.materialProperties || []).map(p => (p ?? '').toLowerCase());
    const filterMaterialProperty = (filters.materialProperties ?? '').toLowerCase();
    const magicalProperties = (i.system.magicalProperties || []).map(p => (p ?? '').toLowerCase());
    const filterMagicalProperty = (filters.magicalProperties ?? '').toLowerCase();
    const weaponFightingStyles = (i.system.weaponFightingStyles || []).map(p => (p ?? '').toLowerCase());
    const filterWeaponFightingStyle = (filters.weaponFightingStyles ?? '').toLowerCase();

    return (
      (!filterEquipmentClass || equipmentClass === filterEquipmentClass) &&
      (
        !filterProperty ||
        properties.includes(filterProperty) ||
        transferredEffects.some(eff => (eff.includes(filterProperty) && eff.type === 'property'))
      ) &&
      (
        !filterMaterialProperty ||
        materialProperties.includes(filterMaterialProperty) ||
        transferredEffects.some(eff => (eff.includes(filterMaterialProperty) && eff.type === 'property'))
      ) &&
      (
        !filterMagicalProperty ||
        magicalProperties.includes(filterMagicalProperty) ||
        transferredEffects.some(eff => (eff.includes(filterMagicalProperty) && eff.type === 'property'))
      ) &&
      (!filterWeaponFightingStyle || weaponFightingStyles.includes(filterWeaponFightingStyle)) &&
      (!filters.powerLevel || i.system.powerLevel === filters.powerLevel) &&
      (!filters.equipped || i.system.equipped) &&
      (!filters.shattered || i.system.shattered) &&
      (!filters.dampened || i.system.dampened) &&
      (!filters.consumable || i.system.consumable)
    );
  });
}


function _sortItems(items, sortKey, ascending, accessor = (i) => i.name) {
  items?.sort((a, b) => {
    const aVal = accessor(a) ?? '';
    const bVal = accessor(b) ?? '';
    return typeof aVal === 'number' ? aVal - bVal : aVal.localeCompare(bVal);
  });
  return ascending ? items : items.reverse();
}