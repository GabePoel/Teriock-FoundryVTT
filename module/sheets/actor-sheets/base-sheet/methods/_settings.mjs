/**
 * Default settings for actor sheet functionality.
 * Contains configuration for menus, filters, and sorting options for various document types.
 * @type {object}
 */
export const _defaultSheetSettings = {
  /**
   * Menu visibility settings for different filter and option panels.
   * @type {object}
   */
  menus: {
    abilityFilters: false,
    abilityOptions: false,
    abilitySort: false,
    equipmentFilters: false,
    equipmentOptions: false,
    equipmentSort: false,
    fluencyOptions: false,
    resourceOptions: false,
    rankOptions: false,
    powerOptions: false,
    effectOptions: false,
  },
  /**
   * Filter settings for abilities including type, cost, and property filters.
   * @type {object}
   */
  abilityFilters: {
    search: "",
    basic: 0,
    standard: 0,
    skill: 0,
    spell: 0,
    ritual: 0,
    rotator: 0,
    verbal: 0,
    somatic: 0,
    material: 0,
    invoked: 0,
    sustained: 0,
    broken: 0,
    hp: 0,
    mp: 0,
    heightened: 0,
    expansion: 0,
    maneuver: null,
    interaction: null,
    powerSource: null,
    element: null,
    effects: null,
  },
  /**
   * Filter settings for equipment including state, properties, and class filters.
   * @type {object}
   */
  equipmentFilters: {
    search: "",
    equipped: 0,
    shattered: 0,
    consumable: 0,
    identified: 0,
    properties: null,
    materialProperties: null,
    magicalProperties: null,
    weaponFightingStyles: null,
    equipmentClasses: null,
    powerLevel: null,
  },
  /** @type {string} */
  abilitySortOption: "name",
  /** @type {boolean} */
  abilitySortAscending: true,
  /** @type {string} */
  equipmentSortOption: "name",
  /** @type {boolean} */
  equipmentSortAscending: true,
};
