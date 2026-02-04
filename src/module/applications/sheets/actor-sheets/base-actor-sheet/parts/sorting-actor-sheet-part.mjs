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
