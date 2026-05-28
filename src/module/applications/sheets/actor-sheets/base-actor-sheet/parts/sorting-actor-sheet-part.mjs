import { objectMap } from "../../../../../helpers/utils.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseSheet}
   * @property {Teriock.Sheet.BaseActorSheetSettings} settings
   * @mixin
   */
  class SortingActorSheetPart extends Base {
    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-action='sheetSelect']").forEach(/** @param {HTMLInputElement} el */ el => {
        el.addEventListener("change", async () => {
          foundry.utils.setProperty(this, el.dataset.path, el.value);
          await this.render();
        });
      });
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.abilities = await this.document.allAbilities();
      context.equipment = context.equipment.filter(e => !e.sup || e.sup.type !== "equipment");
      Object.assign(context, {
        abilities: this._getFilteredAbilities(
          this._sortAbilities(context.abilities.filter(a => a.system.revealed || game.user.isGM)),
        ),
        abilityFilterSelects: [{
          choices: TERIOCK.config.ability.maneuver,
          key: "maneuver",
          label: "TERIOCK.SYSTEMS.Ability.FIELDS.maneuver.label",
          name: "settings.abilityFilters.maneuver",
          selected: this.settings.abilityFilters.maneuver,
        }, {
          choices: TERIOCK.config.ability.interaction,
          key: "interaction",
          label: "TERIOCK.SYSTEMS.Ability.FIELDS.interaction.label",
          name: "settings.abilityFilters.interaction",
          selected: this.settings.abilityFilters.interaction,
        }, {
          choices: TERIOCK.config.ability.delivery,
          key: "delivery",
          label: "TERIOCK.SYSTEMS.Ability.FIELDS.delivery.label",
          name: "settings.abilityFilters.delivery",
          selected: this.settings.abilityFilters.delivery,
        }, {
          choices: TERIOCK.config.ability.targets,
          key: "target",
          label: "TERIOCK.SYSTEMS.Ability.FIELDS.targets.label",
          name: "settings.abilityFilters.target",
          selected: this.settings.abilityFilters.target,
        }, {
          choices: TERIOCK.reference.powerSources,
          key: "powerSource",
          label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
          name: "settings.abilityFilters.powerSource",
          selected: this.settings.abilityFilters.powerSource,
        }, {
          choices: TERIOCK.reference.elements,
          key: "element",
          label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
          name: "settings.abilityFilters.element",
          selected: this.settings.abilityFilters.element,
        }, {
          choices: TERIOCK.reference.effectTypes,
          key: "effectTypes",
          label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
          name: "settings.abilityFilters.effectTypes",
          selected: this.settings.abilityFilters.effectTypes,
        }, {
          choices: TERIOCK.config.piercing.levels,
          key: "piercing",
          label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
          name: "settings.abilityFilters.piercing",
          selected: this.settings.abilityFilters.piercing,
        }],
        abilityFilterToggles: [
          { key: "basic", label: "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label", name: "settings.abilityFilters.basic" },
          {
            key: "standard",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.standard.label",
            name: "settings.abilityFilters.standard",
          },
          { key: "skill", label: "TERIOCK.SYSTEMS.Ability.FIELDS.skill.label", name: "settings.abilityFilters.skill" },
          { key: "spell", label: "TERIOCK.SYSTEMS.Ability.FIELDS.spell.label", name: "settings.abilityFilters.spell" },
          {
            key: "ritual",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label",
            name: "settings.abilityFilters.ritual",
          },
          {
            key: "rotator",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label",
            name: "settings.abilityFilters.rotator",
          },
          {
            key: "heightened",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label",
            name: "settings.abilityFilters.heightened",
          },
          {
            key: "expansion",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
            name: "settings.abilityFilters.expansion",
          },
          { key: "verbal", label: "TERIOCK.TERMS.Costs.verbal", name: "settings.abilityFilters.verbal" },
          { key: "somatic", label: "TERIOCK.TERMS.Costs.somatic", name: "settings.abilityFilters.somatic" },
          { key: "material", label: "TERIOCK.TERMS.Costs.material", name: "settings.abilityFilters.material" },
          { key: "invoked", label: "TERIOCK.TERMS.Costs.invoked", name: "settings.abilityFilters.invoked" },
          {
            key: "hp",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.hp.value.variable.label",
            name: "settings.abilityFilters.hp",
          },
          {
            key: "mp",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.mp.value.variable.label",
            name: "settings.abilityFilters.mp",
          },
          {
            key: "gp",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.gp.value.variable.label",
            name: "settings.abilityFilters.gp",
          },
          {
            key: "sustained",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label",
            name: "settings.abilityFilters.sustained",
          },
        ],
        equipment: this._sortEquipment(this._getFilteredEquipment(context.equipment)),
        equipmentFilterSelects: [{
          choices: TERIOCK.reference.equipmentClasses,
          key: "equipmentClasses",
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
          name: "settings.equipmentFilters.equipmentClasses",
          selected: this.settings.equipmentFilters.equipmentClasses,
        }, {
          choices: TERIOCK.reference.properties,
          key: "properties",
          label: "TERIOCK.PACKS.properties",
          name: "settings.equipmentFilters.properties",
          selected: this.settings.equipmentFilters.properties,
        }, {
          choices: TERIOCK.reference.materialProperties,
          key: "materialProperties",
          label: "TERIOCK.SHEETS.Actor.TABS.Inventory.filters.materialProperties",
          name: "settings.equipmentFilters.materialProperties",
          selected: this.settings.equipmentFilters.materialProperties,
        }, {
          choices: TERIOCK.reference.magicalProperties,
          key: "magicalProperties",
          label: "TERIOCK.SHEETS.Actor.TABS.Inventory.filters.magicalProperties",
          name: "settings.equipmentFilters.magicalProperties",
          selected: this.settings.equipmentFilters.magicalProperties,
        }, {
          choices: TERIOCK.reference.weaponFightingStyles,
          key: "weaponFightingStyles",
          label: "TERIOCK.SYSTEMS.Armament.FIELDS.fightingStyle.label",
          name: "settings.equipmentFilters.weaponFightingStyles",
          selected: this.settings.equipmentFilters.weaponFightingStyles,
        }, {
          choices: objectMap(TERIOCK.config.equipment.powerLevel, e => e.label),
          key: "powerLevel",
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.powerLevel.label",
          name: "settings.equipmentFilters.powerLevel",
          selected: this.settings.equipmentFilters.powerLevel,
        }],
        equipmentFilterToggles: [{
          key: "equipped",
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
          name: "settings.equipmentFilters.equipped",
        }, {
          key: "shattered",
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
          name: "settings.equipmentFilters.shattered",
        }, {
          key: "identified",
          label: "TERIOCK.MODELS.Identification.FIELDS.identified.label",
          name: "settings.equipmentFilters.identified",
        }, {
          key: "consumable",
          label: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label",
          name: "settings.equipmentFilters.consumable",
        }],
      });
      return context;
    }

    /**
     * Sorts abilities based on actor sheet settings.
     * Uses the actor's ability sorting configuration to determine sort criteria.
     * @param {TeriockAbility[]} abilities
     * @returns {TeriockAbility[]} A sorted array of abilities.
     */
    _sortAbilities(abilities) {
      const sortKey = this.settings.abilitySortOption;
      const ascending = this.settings.abilitySortAscending;
      /** @type {Record<string, Teriock.Sheet.AbilitySorter>} */
      const sortMap = {
        enabled: a => Number(a.disabled),
        name: a => a.name,
        sourceName: a => a.parent?.name ?? "",
        sourceType: a => a.parent?.type ?? "",
        type: a => a.system.form ?? "",
      };
      return sortEmbedded(abilities, sortKey, ascending, sortMap) || [];
    }

    /**
     * Sorts equipment based on actor sheet settings.
     * Uses the actor's equipment sort configuration to determine sort criteria.
     * @param {TeriockEquipment[]} equipment
     * @returns {TeriockEquipment[]} Sorted array of equipment.
     */
    _sortEquipment(equipment) {
      const sortKey = this.settings.equipmentSortOption;
      const ascending = this.settings.equipmentSortAscending;
      /** @type {Record<string, Teriock.Sheet.EquipmentSorter>} */
      const sortMap = {
        av: e => e.system.av.value ?? 0,
        bv: e => e.system.bv.value ?? 0,
        consumable: e => Number(e.system.consumable),
        damage: e => e.system.damage.base.currentValue ?? 0,
        equipmentType: e => e.system.equipmentType ?? "",
        equipped: e => Number(e.system.equipped),
        identified: e => Number(e.system.identification.identified),
        minStr: e => e.system.minStr ?? 0,
        name: e => e.name,
        powerLevel: e => e.system.powerLevel ?? 0,
        shattered: e => Number(e.system.shattered),
        tier: e => e.system.tier.value ?? 0,
        weight: e => e.system.totalWeight ?? e.system.weight ?? 0,
      };
      return sortEmbedded(equipment, sortKey, ascending, sortMap);
    }
  };

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
  if (!items || !Array.isArray(items) || items.length === 0) { return []; }
  const accessor = sortMap[sortKey] ?? (i => i.name ?? "");
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aVal = accessor(a) ?? "";
    const bVal = accessor(b) ?? "";
    return typeof aVal === "number" ? aVal - bVal : aVal.localeCompare(bVal);
  });
  return ascending ? sorted : sorted.reverse() || [];
}
