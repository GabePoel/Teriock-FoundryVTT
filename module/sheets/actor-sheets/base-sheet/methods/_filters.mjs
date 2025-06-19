function binaryFilter(filterVal, actualVal) {
  let out = true;
  if (typeof filterVal === "boolean") {
    out = !filterVal || actualVal;
  } else if (typeof filterVal === "number") {
    out = filterVal === 1 ? actualVal : filterVal === -1 ? !actualVal : true;
  }
  return out;
}

function propertyFilter(filterVal, document) {
  if (!filterVal || !document) return true;
  const effects = document.transferredEffects || [];
  const effectNames = effects.map((eff) => eff.name.toLowerCase().replace(/[\s-]/g, ""));
  if (typeof filterVal === "string") {
    const normalizedFilterVal = filterVal.toLowerCase().replace(/[\s-]/g, "");
    return effectNames.some((name) => name.includes(normalizedFilterVal));
  } else if (Array.isArray(filterVal)) {
    const normalizedFilterVals = filterVal.map((fv) => fv.toLowerCase().replace(/[\s-]/g, ""));
    return normalizedFilterVals.some((fv) => effectNames.some((name) => name.includes(fv)));
  }
  return false;
}

export function _filterAbilities(actor) {
  let abilities = actor.effectTypes.ability;
  if (!abilities || !Array.isArray(abilities) || abilities.length === 0) {
    return [];
  }
  const filters = actor.system.sheet.abilityFilters || {};
  abilities = abilities.filter(
    (i) =>
      binaryFilter(filters.basic, i.system.basic) &&
      binaryFilter(filters.standard, i.system.standard) &&
      binaryFilter(filters.skill, i.system.skill) &&
      binaryFilter(filters.spell, i.system.spell) &&
      binaryFilter(filters.ritual, i.system.ritual) &&
      binaryFilter(filters.rotator, i.system.rotator) &&
      binaryFilter(filters.sustained, i.system.sustained) &&
      binaryFilter(filters.heightened, i.system.heightened) &&
      binaryFilter(filters.expansion, i.system.expansion) &&
      binaryFilter(filters.verbal, i.system.costs.verbal) &&
      binaryFilter(filters.somatic, i.system.costs.somatic) &&
      binaryFilter(filters.material, i.system.costs.material) &&
      binaryFilter(filters.invoked, i.system.costs.invoked) &&
      binaryFilter(filters.hp, i.system.costs.hp) &&
      binaryFilter(filters.mp, i.system.costs.mp) &&
      binaryFilter(filters.broken, i.system.break) &&
      (!filters.maneuver || i.system.maneuver === filters.maneuver) &&
      (!filters.interaction || i.system.interaction === filters.interaction) &&
      (!filters.delivery || i.system.delivery.base === filters.delivery) &&
      (!filters.target || (i.system.targets || []).includes(filters.target)) &&
      (!filters.powerSource || (i.system.powerSources || []).includes(filters.powerSource)) &&
      (!filters.element || (i.system.elements || []).includes(filters.element)) &&
      (!filters.effects || filters.effects.every((e) => i.system.effects.includes(e))),
  );
  return abilities;
}

export function _filterEquipment(actor) {
  let equipment = actor.itemTypes.equipment;
  if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
    return [];
  }
  const filters = actor.system.sheet.equipmentFilters || {};
  equipment = equipment.filter(
    (i) =>
      propertyFilter(filters.properties, i) &&
      propertyFilter(filters.materialProperties, i) &&
      propertyFilter(filters.magicalProperties, i) &&
      binaryFilter(filters.powerLevel, i.system.powerLevel) &&
      binaryFilter(filters.equipped, i.system.equipped) &&
      binaryFilter(filters.shattered, i.system.shattered) &&
      binaryFilter(filters.identified, i.system.identified) &&
      binaryFilter(filters.consumable, i.system.consumable) &&
      (!filters.equipmentClass || (i.system.equipmentClasses || []).includes(filters.equipmentClass)) &&
      (!filters.weaponFightingStyles || i.system.sb === filters.weaponFightingStyle),
  );
  return equipment;
}
