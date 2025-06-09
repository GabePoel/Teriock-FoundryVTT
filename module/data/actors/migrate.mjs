function booleanToNumber(value) {
  if (typeof value === 'number') {
    return value;
  }
  return value ? 1 : 0;
}

export function migrate(data) {
  data.sheet.abilityFilters.basic = booleanToNumber(data.sheet.abilityFilters.basic);
  data.sheet.abilityFilters.standard = booleanToNumber(data.sheet.abilityFilters.standard);
  data.sheet.abilityFilters.skill = booleanToNumber(data.sheet.abilityFilters.skill);
  data.sheet.abilityFilters.spell = booleanToNumber(data.sheet.abilityFilters.spell);
  data.sheet.abilityFilters.ritual = booleanToNumber(data.sheet.abilityFilters.ritual);
  data.sheet.abilityFilters.rotator = booleanToNumber(data.sheet.abilityFilters.rotator);
  data.sheet.abilityFilters.verbal = booleanToNumber(data.sheet.abilityFilters.verbal);
  data.sheet.abilityFilters.somatic = booleanToNumber(data.sheet.abilityFilters.somatic);
  data.sheet.abilityFilters.material = booleanToNumber(data.sheet.abilityFilters.material);
  data.sheet.abilityFilters.invoked = booleanToNumber(data.sheet.abilityFilters.invoked);
  data.sheet.abilityFilters.sustained = booleanToNumber(data.sheet.abilityFilters.sustained);
  data.sheet.abilityFilters.broken = booleanToNumber(data.sheet.abilityFilters.broken);
  data.sheet.abilityFilters.hp = booleanToNumber(data.sheet.abilityFilters.hp);
  data.sheet.abilityFilters.mp = booleanToNumber(data.sheet.abilityFilters.mp);
  data.sheet.abilityFilters.heightened = booleanToNumber(data.sheet.abilityFilters.heightened);
  data.sheet.abilityFilters.expansion = booleanToNumber(data.sheet.abilityFilters.expansion);
  data.sheet.equipmentFilters.equipped = booleanToNumber(data.sheet.equipmentFilters.equipped);
  data.sheet.equipmentFilters.shattered = booleanToNumber(data.sheet.equipmentFilters.shattered);
  data.sheet.equipmentFilters.consumable = booleanToNumber(data.sheet.equipmentFilters.consumable);
  data.sheet.equipmentFilters.identified = booleanToNumber(data.sheet.equipmentFilters.identified);
  return data;
}