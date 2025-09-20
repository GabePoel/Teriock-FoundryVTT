/**
 * Applies a binary filter to a value based on filter criteria.
 * Handles boolean and numeric filter values with different logic.
 * @param {Teriock.UI.ThreeToggle} filterVal - The filter value to apply.
 * @param {boolean|string|number} actualVal - The actual value to filter.
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
 * Filters abilities based on various criteria including type, costs, and properties.
 * Applies multiple filters to narrow down the ability list.
 * @param {TeriockActor} actor - The actor whose abilities to filter.
 * @param {TeriockAbility[]} abilities - Array of abilities to filter.
 * @param {Partial<AbilityFilters>} filters - Object containing filter criteria.
 * @returns {Array} Filtered array of abilities.
 */
export function _filterAbilities(actor, abilities, filters = {}) {
  if (!abilities || !Array.isArray(abilities) || abilities.length === 0) {
    return [];
  }
  abilities = abilities.filter((a) => !a.isReference
    && binaryFilter(filters.basic, a.system.basic)
    && binaryFilter(
      filters.standard,
      a.system.standard,
    )
    && binaryFilter(filters.skill, a.system.skill)
    && binaryFilter(filters.spell, a.system.spell)
    && binaryFilter(filters.ritual, a.system.ritual)
    && binaryFilter(
      filters.rotator,
      a.system.rotator,
    )
    && binaryFilter(filters.sustained, a.system.sustained)
    && binaryFilter(filters.heightened, a.system.heightened)
    && binaryFilter(filters.expansion, a.system.expansion)
    && binaryFilter(filters.verbal, a.system.costs.verbal)
    && binaryFilter(filters.somatic, a.system.costs.somatic)
    && binaryFilter(filters.material, a.system.costs.material)
    && binaryFilter(filters.invoked, a.system.invoked)
    && binaryFilter(filters.hp, a.system.costs.hp.type !== "none")
    && binaryFilter(filters.mp, a.system.costs.mp.type !== "none")
    && binaryFilter(filters.broken, a.system.break)
    && (!filters.maneuver || a.system.maneuver === filters.maneuver)
    && (!filters.interaction || a.system.interaction === filters.interaction)
    && (!filters.delivery || a.system.delivery.base === filters.delivery)
    && (!filters.piercing || a.system.piercing === filters.piercing)
    && (!filters.target || (a.system.targets || new Set()).has(filters.target))
    && (!filters.powerSource || (a.system.powerSources || new Set()).has(filters.powerSource))
    && (!filters.element || (a.system.elements || new Set()).has(filters.element))
    && (!filters.effectTypes || (a.system.effectTypes || new Set()).some((e) => filters.effectTypes.includes(e))));
  return abilities;
}

/**
 * Filters equipment based on various criteria including properties, state, and class.
 * Applies multiple filters to narrow down the equipment list.
 * @param {TeriockActor} actor - The actor whose equipment to filter.
 * @param {TeriockEquipment[]} equipment - Array of equipment to filter.
 * @param {Partial<EquipmentFilters>} filters - Object containing filter criteria.
 * @returns {Array} Filtered array of equipment.
 */
export function _filterEquipment(actor, equipment, filters = {}) {
  if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
    return [];
  }
  equipment = equipment.filter((e) => (!filters.properties || e.effectKeys.property.has(filters.properties))
    && (!filters.materialProperties || e.effectKeys.property.has(filters.materialProperties))
    && (!filters.magicalProperties || e.effectKeys.property.has(filters.magicalProperties))
    && binaryFilter(filters.equipped, e.system.equipped)
    && binaryFilter(filters.shattered, e.system.shattered)
    && binaryFilter(filters.identified, e.system.identified)
    && binaryFilter(filters.consumable, e.system.consumable)
    && (!filters.powerLevel || e.system.powerLevel === filters.powerLevel)
    && (!filters.equipmentClasses || (e.system.equipmentClasses || new Set()).has(filters.equipmentClasses))
    && (!filters.weaponFightingStyles || e.system.fightingStyle === filters.weaponFightingStyles));
  return equipment;
}
