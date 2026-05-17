import { toCamelCase } from "../../../../../helpers/string.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseActorSheet}
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
      if (!abilities || !Array.isArray(abilities)) return [];
      return abilities.filter(
        a =>
          !a.isReference &&
          binaryFilter(filters.basic, a.system.isBasic) &&
          binaryFilter(filters.standard, a.system.standard) &&
          binaryFilter(filters.skill, a.system.skill) &&
          binaryFilter(filters.spell, a.system.spell) &&
          binaryFilter(filters.ritual, a.system.ritual) &&
          binaryFilter(filters.rotator, a.system.rotator) &&
          binaryFilter(filters.sustained, a.system.sustained) &&
          binaryFilter(filters.heightened, a.system.heightened) &&
          binaryFilter(filters.expansion, a.system.expansion.type) &&
          binaryFilter(filters.verbal, a.system.costs.components.verbal.type) &&
          binaryFilter(filters.somatic, a.system.costs.components.somatic.type) &&
          binaryFilter(filters.material, a.system.costs.components.material.type) &&
          binaryFilter(filters.invoked, a.system.invoked) &&
          binaryFilter(filters.hp, a.system.costs.primary.hp.type) &&
          binaryFilter(filters.mp, a.system.costs.primary.mp.type) &&
          binaryFilter(filters.gp, a.system.costs.primary.gp.type) &&
          (!filters.maneuver || a.system.maneuver === filters.maneuver) &&
          (!filters.interaction || a.system.interaction === filters.interaction) &&
          (!filters.delivery || a.system.delivery === filters.delivery) &&
          (!filters.piercing || a.system.piercing.raw === Number(filters.piercing)) &&
          (!filters.target || (a.system.targets || new Set()).has(filters.target)) &&
          (!filters.powerSource || (a.system.powerSources || new Set()).has(filters.powerSource)) &&
          (!filters.element || (a.system.elements || new Set()).has(filters.element)) &&
          (!filters.effectTypes || (a.system.effectTypes || new Set()).some(e => filters.effectTypes.includes(e))),
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
      if (!equipment || !Array.isArray(equipment)) return [];
      return equipment.filter(
        e =>
          (!filters.properties || hasProperty(e, filters.properties)) &&
          (!filters.materialProperties || hasProperty(e, filters.materialProperties)) &&
          (!filters.magicalProperties || hasProperty(e, filters.magicalProperties)) &&
          binaryFilter(filters.equipped, e.system.equipped) &&
          binaryFilter(filters.shattered, e.system.shattered) &&
          binaryFilter(filters.identified, e.system.identification.identified) &&
          binaryFilter(filters.consumable, e.system.consumable) &&
          (!filters.powerLevel || e.system.powerLevel === filters.powerLevel) &&
          (!filters.equipmentClasses || (e.system.equipmentClasses || new Set()).has(filters.equipmentClasses)) &&
          (!filters.weaponFightingStyles || e.system.fightingStyle === filters.weaponFightingStyles),
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      /** @type {NodeListOf<HTMLSelectElement>} */
      const filterSelects = this.element.querySelectorAll(
        'select[name^="settings.abilityFilters"], select[name^="settings.equipmentFilters"]',
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
 * Whether some equipment has a property that matches some key.
 * @param {TeriockEquipment} equipment
 * @param {string} propertyKey
 * @returns {boolean}
 */
function hasProperty(equipment, propertyKey) {
  return equipment.properties.map(p => toCamelCase(p.forcedIdentifier)).includes(propertyKey);
}
