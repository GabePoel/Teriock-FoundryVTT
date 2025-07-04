/**
 * Default settings for actor sheet functionality.
 * Contains configuration for menus, filters, and sorting options for various document types.
 * @type {object}
 */
export const _defaultSheetSettings = {
  /**
   * Menus that can be displayed for each page.
   * @type {object}
   */
  menus: {
    /**
     * Show ability filters menu.
     * @type {boolean}
     */
    abilityFilters: false,
    /**
     * Show ability options menu.
     * @type {boolean}
     */
    abilityOptions: false,
    /**
     * Show ability sort menu.
     * @type {boolean}
     */
    abilitySort: false,
    /**
     * Show equipment filters menu.
     * @type {boolean}
     */
    equipmentFilters: false,
    /**
     * Show equipment options menu.
     * @type {boolean}
     */
    equipmentOptions: false,
    /**
     * Show equipment sort menu.
     * @type {boolean}
     */
    equipmentSort: false,
    /**
     * Show fluency options menu.
     * @type {boolean}
     */
    fluencyOptions: false,
    /**
     * Show resource options menu.
     * @type {boolean}
     */
    resourceOptions: false,
    /**
     * Show rank options menu.
     * @type {boolean}
     */
    rankOptions: false,
    /**
     * Show power options menu.
     * @type {boolean}
     */
    powerOptions: false,
    /**
     * Show effect options menu.
     * @type {boolean}
     */
    effectOptions: false,
  },
  /**
   * Filters to change what abilities are displayed.
   * @type {object}
   */
  abilityFilters: {
    /**
     * Currently applied search term.
     * @type {string}
     */
    search: "",
    /**
     * Three-way toggle. Show, hide, or don't filter based on if basic.
     * @type {1|0|-1}
     */
    basic: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if standard.
     * @type {1|0|-1}
     */
    standard: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if skill.
     * @type {1|0|-1}
     */
    skill: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if spell.
     * @type {1|0|-1}
     */
    spell: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if ritual.
     * @type {1|0|-1}
     */
    ritual: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if rotator.
     * @type {1|0|-1}
     */
    rotator: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if verbal cost.
     * @type {1|0|-1}
     */
    verbal: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if somatic cost.
     * @type {1|0|-1}
     */
    somatic: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if material cost.
     * @type {1|0|-1}
     */
    material: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if invoked.
     * @type {1|0|-1}
     */
    invoked: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if sustained.
     * @type {1|0|-1}
     */
    sustained: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if break cost.
     * @type {1|0|-1}
     */
    broken: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if HP cost.
     * @type {1|0|-1}
     */
    hp: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if MP cost.
     * @type {1|0|-1}
     */
    mp: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if heightenable.
     * @type {1|0|-1}
     */
    heightened: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if expansion.
     * @type {1|0|-1}
     */
    expansion: 0,
    /**
     * If filter is applied, which maneuver is displayed.
     * @type {string|null}
     */
    maneuver: null,
    /**
     * If filter is applied, which interaction is displayed.
     * @type {string|null}
     */
    interaction: null,
    /**
     * If filter is applied, which power source type is displayed.
     * @type {string|null}
     */
    powerSource: null,
    /**
     * If filter is applied, which element is displayed.
     * @type {string|null}
     */
    element: null,
    /**
     * If filter is applied, which effect type is displayed.
     * @type {string|null}
     */
    effects: null,
  },
  /**
   * Filters to change what equipment is displayed.
   * @type {object}
   */
  equipmentFilters: {
    /**
     * Currently applied search term.
     * @type {string}
     */
    search: "",
    /**
     * Three-way toggle. Show, hide, or don't filter based on if equipped.
     * @type {1|0|-1}
     */
    equipped: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if shattered.
     * @type {1|0|-1}
     */
    shattered: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if consumable.
     * @type {1|0|-1}
     */
    consumable: 0,
    /**
     * Three-way toggle. Show, hide, or don't filter based on if identified.
     * @type {1|0|-1}
     */
    identified: 0,
    /**
     * If filter is applied, which property is displayed.
     * @type {string|null}
     */
    properties: null,
    /**
     * If filter is applied, which material property is displayed.
     * @type {string|null}
     */
    materialProperties: null,
    /**
     * If filter is applied, which magical property is displayed.
     * @type {string|null}
     */
    magicalProperties: null,
    /**
     * If filter is applied, which weapon fighting style is displayed.
     * @type {string|null}
     */
    weaponFightingStyles: null,
    /**
     * If filter is applied, which equipment class is displayed.
     * @type {string|null}
     */
    equipmentClasses: null,
    /**
     * If filter is applied, which power level is displayed.
     * @type {string|null}
     */
    powerLevel: null,
  },
  /**
   * Key used to determine how abilities are sorted.
   * @type {string}
   */
  abilitySortOption: "name",
  /**
   * Ability sort direction.
   * @type {boolean}
   */
  abilitySortAscending: true,
  /**
   * Key used to determine how equipment are sorted.
   * @type {string}
   */
  equipmentSortOption: "name",
  /**
   * Equipment sort direction.
   * @type {boolean}
   */
  equipmentSortAscending: true,
  /**
   * Whether the rules text for a given condition is expanded or collapsed.
   * @type {Record<string,boolean>}
   */
  conditionExpansions: {},
};
