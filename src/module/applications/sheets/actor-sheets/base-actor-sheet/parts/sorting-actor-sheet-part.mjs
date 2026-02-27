//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class SortingActorSheetPart extends Base {
    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-action='sheetSelect']").forEach(
        /** @param {HTMLInputElement} el */ (el) => {
          el.addEventListener("change", async () => {
            foundry.utils.setProperty(this, el.dataset.path, el.value);
            await this.render();
          });
        },
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.abilities = await this.document.allAbilities();
      context.equipment = context.equipment.filter(
        (e) => !e.sup || e.sup.type !== "equipment",
      );
      Object.assign(context, {
        abilities: this._getFilteredAbilities(
          this._sortAbilities(
            context.abilities.filter(
              (a) => a.system.revealed || game.user.isGM,
            ),
          ),
        ),
        equipment: this._sortEquipment(
          this._getFilteredEquipment(context.equipment),
        ),
        abilityFilterSelects: [
          {
            key: "maneuver",
            name: "settings.abilityFilters.maneuver",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.maneuver.label",
            choices: TERIOCK.options.ability.maneuver,
            selected: this.settings.abilityFilters.maneuver,
          },
          {
            key: "interaction",
            name: "settings.abilityFilters.interaction",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.interaction.label",
            choices: TERIOCK.options.ability.interaction,
            selected: this.settings.abilityFilters.interaction,
          },
          {
            key: "delivery",
            name: "settings.abilityFilters.delivery",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.delivery.label",
            choices: TERIOCK.options.ability.delivery,
            selected: this.settings.abilityFilters.delivery,
          },
          {
            key: "target",
            name: "settings.abilityFilters.target",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.targets.label",
            choices: TERIOCK.options.ability.targets,
            selected: this.settings.abilityFilters.target,
          },
          {
            key: "powerSource",
            name: "settings.abilityFilters.powerSource",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.powerSources.label",
            choices: TERIOCK.options.ability.powerSources,
            selected: this.settings.abilityFilters.powerSource,
          },
          {
            key: "element",
            name: "settings.abilityFilters.element",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.elements.label",
            choices: TERIOCK.options.ability.elements,
            selected: this.settings.abilityFilters.element,
          },
          {
            key: "effectTypes",
            name: "settings.abilityFilters.effectTypes",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.effectTypes.label",
            choices: TERIOCK.options.ability.effectTypes,
            selected: this.settings.abilityFilters.effectTypes,
          },
          {
            key: "piercing",
            name: "settings.abilityFilters.piercing",
            label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
            choices: TERIOCK.options.piercing.levels,
            selected: this.settings.abilityFilters.piercing,
          },
        ],
        abilityFilterToggles: [
          {
            key: "basic",
            name: "settings.abilityFilters.basic",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label",
          },
          {
            key: "standard",
            name: "settings.abilityFilters.standard",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.standard.label",
          },
          {
            key: "skill",
            name: "settings.abilityFilters.skill",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.skill.label",
          },
          {
            key: "spell",
            name: "settings.abilityFilters.spell",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.spell.label",
          },
          {
            key: "ritual",
            name: "settings.abilityFilters.ritual",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label",
          },
          {
            key: "rotator",
            name: "settings.abilityFilters.rotator",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label",
          },
          {
            key: "heightened",
            name: "settings.abilityFilters.heightened",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label",
          },
          {
            key: "expansion",
            name: "settings.abilityFilters.expansion",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
          },
          {
            key: "verbal",
            name: "settings.abilityFilters.verbal",
            label: "TERIOCK.TERMS.Costs.verbal",
          },
          {
            key: "somatic",
            name: "settings.abilityFilters.somatic",
            label: "TERIOCK.TERMS.Costs.somatic",
          },
          {
            key: "material",
            name: "settings.abilityFilters.material",
            label: "TERIOCK.TERMS.Costs.material",
          },
          {
            key: "invoked",
            name: "settings.abilityFilters.invoked",
            label: "TERIOCK.TERMS.Costs.invoked",
          },
          {
            key: "hp",
            name: "settings.abilityFilters.hp",
            label:
              "TERIOCK.SYSTEMS.Ability.FIELDS.costs.hp.value.variable.label",
          },
          {
            key: "mp",
            name: "settings.abilityFilters.mp",
            label:
              "TERIOCK.SYSTEMS.Ability.FIELDS.costs.mp.value.variable.label",
          },
          {
            key: "broken",
            name: "settings.abilityFilters.broken",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.break.label",
          },
          {
            key: "sustained",
            name: "settings.abilityFilters.sustained",
            label: "TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label",
          },
        ],
        equipmentFilterSelects: [
          {
            key: "equipmentClasses",
            name: "settings.equipmentFilters.equipmentClasses",
            label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
            choices: TERIOCK.options.equipment.equipmentClasses,
            selected: this.settings.equipmentFilters.equipmentClasses,
          },
          {
            key: "properties",
            name: "settings.equipmentFilters.properties",
            label: "TERIOCK.PACKS.properties",
            choices: TERIOCK.reference.properties,
            selected: this.settings.equipmentFilters.properties,
          },
          {
            key: "materialProperties",
            name: "settings.equipmentFilters.materialProperties",
            label:
              "TERIOCK.SHEETS.Actor.TABS.Inventory.filters.materialProperties",
            choices: TERIOCK.reference.materialProperties,
            selected: this.settings.equipmentFilters.materialProperties,
          },
          {
            key: "magicalProperties",
            name: "settings.equipmentFilters.magicalProperties",
            label:
              "TERIOCK.SHEETS.Actor.TABS.Inventory.filters.magicalProperties",
            choices: TERIOCK.reference.magicalProperties,
            selected: this.settings.equipmentFilters.magicalProperties,
          },
          {
            key: "weaponFightingStyles",
            name: "settings.equipmentFilters.weaponFightingStyles",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.fightingStyle.label",
            choices: TERIOCK.options.equipment.weaponFightingStyles,
            selected: this.settings.equipmentFilters.weaponFightingStyles,
          },
          {
            key: "powerLevel",
            name: "settings.equipmentFilters.powerLevel",
            label: "TERIOCK.SYSTEMS.Equipment.FIELDS.powerLevel.label",
            choices: TERIOCK.options.equipment.powerLevelShort,
            selected: this.settings.equipmentFilters.powerLevel,
          },
        ],
        equipmentFilterToggles: [
          {
            key: "equipped",
            name: "settings.equipmentFilters.equipped",
            label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
          },
          {
            key: "shattered",
            name: "settings.equipmentFilters.shattered",
            label: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
          },
          {
            key: "identified",
            name: "settings.equipmentFilters.identified",
            label: "TERIOCK.MODELS.Identification.FIELDS.identified.label",
          },
          {
            key: "consumable",
            name: "settings.equipmentFilters.consumable",
            label: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label",
          },
        ],
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
        name: (a) => a.name,
        sourceName: (a) => a.parent?.name ?? "",
        sourceType: (a) => a.parent?.type ?? "",
        enabled: (a) => Number(a.disabled),
        type: (a) => a.system.form ?? "",
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
        name: (e) => e.name,
        av: (e) => e.system.av.value ?? 0,
        bv: (e) => e.system.bv.value ?? 0,
        consumable: (e) => Number(e.system.consumable),
        damage: (e) => e.system.damage.base.currentValue ?? 0,
        identified: (e) => Number(e.system.identification.identified),
        equipmentType: (e) => e.system.equipmentType ?? "",
        equipped: (e) => Number(e.system.equipped),
        minStr: (e) => e.system.minStr.value ?? 0,
        powerLevel: (e) => e.system.powerLevel ?? 0,
        shattered: (e) => Number(e.system.shattered),
        tier: (e) => e.system.tier.value ?? 0,
        weight: (e) => e.system.weight.value ?? 0,
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
  return ascending ? sorted : sorted.reverse() || [];
}
