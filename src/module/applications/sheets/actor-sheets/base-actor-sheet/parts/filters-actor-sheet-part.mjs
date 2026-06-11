import { toCamelCase } from "../../../../../helpers/string.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseSheet}
   * @mixin
   */
  class FiltersActorSheetPart extends Base {
    /**
     * Gets filtered abilities based on current settings.
     * Filters abilities based on various criteria including type, costs, and properties.
     * @param {TeriockAbility[]} abilities - Array of abilities to filter.
     * @returns {Array} Filtered abilities array.
     */
    _getFilteredAbilities(abilities = []) {
      const filters = this.settings.abilityFilters || {};
      if (!abilities || !Array.isArray(abilities)) { return []; }
      return abilities.filter(a =>
        !a.isReference
        && ternaryFilter(filters.basic, a.system.isBasic)
        && ternaryFilter(filters.standard, a.system.standard)
        && ternaryFilter(filters.skill, a.system.skill)
        && ternaryFilter(filters.spell, a.system.spell)
        && ternaryFilter(filters.ritual, a.system.ritual)
        && ternaryFilter(filters.rotator, a.system.rotator)
        && ternaryFilter(filters.sustained, a.system.sustained)
        && ternaryFilter(filters.heightened, a.system.heightened)
        && ternaryFilter(filters.expansion, a.system.expansion.type)
        && ternaryFilter(filters.verbal, a.system.costs.components.verbal.type)
        && ternaryFilter(filters.somatic, a.system.costs.components.somatic.type)
        && ternaryFilter(filters.material, a.system.costs.components.material.type)
        && ternaryFilter(filters.invoked, a.system.invoked)
        && ternaryFilter(filters.hp, a.system.costs.primary.hp.type)
        && ternaryFilter(filters.mp, a.system.costs.primary.mp.type)
        && ternaryFilter(filters.gp, a.system.costs.primary.gp.type)
        && (!filters.maneuver || a.system.maneuver === filters.maneuver)
        && (!filters.interaction || a.system.interaction === filters.interaction)
        && (!filters.delivery || a.system.delivery === filters.delivery)
        && (!filters.piercing || a.system.piercing.raw === Number(filters.piercing))
        && (!filters.target || (a.system.targets || new Set()).has(filters.target))
        && (!filters.powerSource || (a.system.powerSources || new Set()).has(filters.powerSource))
        && (!filters.element || (a.system.elements || new Set()).has(filters.element))
        && (!filters.effectTypes || (a.system.effectTypes || new Set()).some(e => filters.effectTypes.includes(e)))
      );
    }

    /**
     * Gets filtered equipment based on current settings.
     * Filters equipment based on various criteria including properties, state, and class.
     * @param {TeriockEquipment[]} equipment - Array of equipment to filter.
     * @returns {Array} Filtered equipment array.
     */
    _getFilteredEquipment(equipment = []) {
      const filters = this.settings.equipmentFilters || {};
      if (!equipment || !Array.isArray(equipment)) { return []; }
      return equipment.filter(e =>
        (!filters.properties || hasProperty(e, filters.properties))
        && (!filters.materialProperties || hasProperty(e, filters.materialProperties))
        && (!filters.magicalProperties || hasProperty(e, filters.magicalProperties))
        && ternaryFilter(filters.equipped, e.system.equipped)
        && ternaryFilter(filters.shattered, e.system.shattered)
        && ternaryFilter(filters.identified, e.system.identification.identified)
        && ternaryFilter(filters.consumable, e.system.consumable)
        && (!filters.powerLevel || e.system.powerLevel === filters.powerLevel)
        && (!filters.equipmentClasses || (e.system.equipmentClasses || new Set()).has(filters.equipmentClasses))
        && (!filters.weaponFightingStyles || e.system.fightingStyle === filters.weaponFightingStyles)
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      /** @type {NodeListOf<HTMLSelectElement>} */
      const filterSelects = this.element.querySelectorAll(
        "select[name^=\"settings.abilityFilters\"], select[name^=\"settings.equipmentFilters\"]",
      );
      filterSelects.forEach(el => {
        el.addEventListener("change", async e => {
          /** @type {HTMLSelectElement} */
          const filterSelect = e.target;
          foundry.utils.setProperty(this, filterSelect.name, e.target.value);
          await this.render();
        });
      });
    }
  };

/**
 * Applies a ternary filter to a value based on filter criteria.
 * @param {Teriock.UI.ThreeToggle} filterVal - The filter value to apply.
 * @param {boolean|string|number} actualVal - The actual value to filter.
 * @returns {boolean} True if the value passes the filter, false otherwise.
 */
function ternaryFilter(filterVal, actualVal) {
  if (filterVal === null) { return true; }
  return filterVal ? Boolean(actualVal) : !actualVal;
}

/**
 * Whether some equipment has a property that matches some key.
 * @param {TeriockEquipment} equipment
 * @param {string} propertyKey
 * @returns {boolean}
 */
function hasProperty(equipment, propertyKey) {
  return equipment.properties.map(p => toCamelCase(p.forcedIdentifier)).includes(propertyKey);
}
