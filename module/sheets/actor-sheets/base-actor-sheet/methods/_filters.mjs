/**
 * Applies a binary filter to a value based on filter criteria.
 * Handles boolean and numeric filter values with different logic.
 * @param {boolean|number} filterVal - The filter value to apply.
 * @param {boolean} actualVal - The actual value to filter.
 * @returns {boolean} True if the value passes the filter, false otherwise.
 */
function binaryFilter(filterVal, actualVal) {
  let out = true;
  if (typeof filterVal === "boolean") {
    out = !filterVal || actualVal;
  } else if (typeof filterVal === "number") {
    out = filterVal === 1 ? actualVal : filterVal === -1 ? !actualVal : true;
  }
  return out;
}

/**
 * Filters documents based on their transferred effects.
 * Checks if any of the document's effects match the filter criteria.
 * @param {string|Array} filterVal - The filter value(s) to match against effect names.
 * @param {Document} document - The document to filter.
 * @returns {boolean} True if the document passes the filter, false otherwise.
 */
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

/**
 * Filters abilities based on various criteria including type, costs, and properties.
 * Applies multiple filters to narrow down the ability list.
 * @param {Actor} actor - The actor whose abilities to filter.
 * @param {Array} abilities - Array of abilities to filter.
 * @param {object} filters - Object containing filter criteria.
 * @returns {Array} Filtered array of abilities.
 */
export function _filterAbilities(actor, abilities, filters = {}) {
  if (!abilities || !Array.isArray(abilities) || abilities.length === 0) {
    return [];
  }
  abilities = abilities.filter(
    (i) =>
      !i.isReference &&
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
      (!filters.piercing || i.system.piercing === filters.piercing) &&
      (!filters.target || (i.system.targets || []).includes(filters.target)) &&
      (!filters.powerSource || (i.system.powerSources || []).includes(filters.powerSource)) &&
      (!filters.element || (i.system.elements || []).includes(filters.element)) &&
      (!filters.effects || (i.system.effects || []).some((e) => filters.effects.includes(e))),
  );
  return abilities;
}

/**
 * Filters equipment based on various criteria including properties, state, and class.
 * Applies multiple filters to narrow down the equipment list.
 * @param {Actor} actor - The actor whose equipment to filter.
 * @param {Array} equipment - Array of equipment to filter.
 * @param {object} filters - Object containing filter criteria.
 * @returns {Array} Filtered array of equipment.
 */
export function _filterEquipment(actor, equipment, filters = {}) {
  if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
    return [];
  }
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
