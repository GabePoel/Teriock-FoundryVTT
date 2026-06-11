/** @type {Teriock.UI.ThreeToggle} */
const threeToggleInitial = null;

/**
 * @returns {Teriock.Sheet.BaseActorSheetSettings}
 */
export default function defaultSheetSettings() {
  return {
    abilityFilters: {
      basic: game.teriock.getSetting("hideBasicAbilitiesByDefault") ? false : null,
      delivery: null,
      effectTypes: null,
      element: null,
      expansion: threeToggleInitial,
      gp: threeToggleInitial,
      heightened: threeToggleInitial,
      hp: threeToggleInitial,
      interaction: null,
      invoked: threeToggleInitial,
      maneuver: null,
      material: threeToggleInitial,
      mp: threeToggleInitial,
      piercing: null,
      powerSource: null,
      ritual: threeToggleInitial,
      rotator: threeToggleInitial,
      search: "",
      skill: threeToggleInitial,
      somatic: threeToggleInitial,
      spell: threeToggleInitial,
      standard: threeToggleInitial,
      sustained: threeToggleInitial,
      target: null,
      verbal: threeToggleInitial,
    },
    abilitySortAscending: true,
    abilitySortOption: "name",
    avatarImagePath: "img",
    conditionExpansions: {},
    equipmentFilters: {
      consumable: threeToggleInitial,
      equipmentClasses: null,
      equipped: threeToggleInitial,
      identified: threeToggleInitial,
      magicalProperties: null,
      materialProperties: null,
      powerLevel: null,
      properties: null,
      search: "",
      shattered: threeToggleInitial,
      weaponFightingStyles: null,
    },
    equipmentSortAscending: true,
    equipmentSortOption: "name",
    menus: {
      abilityFilters: false,
      abilityOptions: false,
      abilitySort: false,
      consequenceOptions: false,
      equipmentFilters: false,
      equipmentOptions: false,
      equipmentSort: false,
      fluencyOptions: false,
      powerOptions: false,
      rankOptions: false,
      resourceOptions: false,
    },
  };
}
