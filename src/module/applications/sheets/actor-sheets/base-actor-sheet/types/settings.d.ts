/**
 * Actor sheet display settings.
 */
export interface BaseActorSheetSettings {
  /**
   * Menus that can be displayed for each page.
   */
  menus: {
    /** Show ability filters menu. */
    abilityFilters: boolean;
    /** Show ability options menu. */
    abilityOptions: boolean;
    /** Show ability sort menu. */
    abilitySort: boolean;
    /** Show equipment filters menu. */
    equipmentFilters: boolean;
    /** Show equipment options menu. */
    equipmentOptions: boolean;
    /** Show equipment sort menu. */
    equipmentSort: boolean;
    /** Show fluency options menu. */
    fluencyOptions: boolean;
    /** Show resource options menu. */
    resourceOptions: boolean;
    /** Show rank options' menu. */
    rankOptions: boolean;
    /** Show power options' menu. */
    powerOptions: boolean;
    /** Show effect options menu. */
    consequenceOptions: boolean;
  };

  /**
   * Filters to change what abilities are displayed.
   */
  abilityFilters: AbilityFilters;

  /**
   * Filters to change what equipment is displayed.
   */
  equipmentFilters: EquipmentFilters;

  /** Key used to determine how abilities are sorted. */
  abilitySortOption: string;

  /** Ability sort direction. */
  abilitySortAscending: boolean;

  /** Key used to determine how equipment are sorted. */
  equipmentSortOption: string;

  /** Equipment sort direction. */
  equipmentSortAscending: boolean;

  /** Whether the rules text for a given condition is expanded or collapsed. */
  conditionExpansions: Record<Teriock.Parameters.Condition.Key, boolean>;
}

/**
 * Filters to change what abilities are displayed.
 */
export interface AbilityFilters {
  /** Currently applied search term. */
  search: string;
  /** Show, hide, or don't filter based on if basic. */
  basic: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if standard. */
  standard: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a skill. */
  skill: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a spell. */
  spell: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a ritual. */
  ritual: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a rotator. */
  rotator: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if verbal cost. */
  verbal: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if somatic cost. */
  somatic: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if material cost. */
  material: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if invoked. */
  invoked: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if sustained. */
  sustained: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if break cost. */
  broken: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if HP cost. */
  hp: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if MP cost. */
  mp: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if heightenable. */
  heightened: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if expansion. */
  expansion: Teriock.UI.ThreeToggle;
  /** If filter is applied, which maneuver is displayed. */
  maneuver: Teriock.Parameters.Ability.Maneuver | null;
  /** If filter is applied, which interaction is displayed. */
  interaction: Teriock.Parameters.Ability.Interaction | null;
  /** If filter is applied, which power source type is displayed. */
  powerSource: Teriock.Parameters.Ability.PowerSource | null;
  /** If filter is applied, which element is displayed. */
  element: Teriock.Parameters.Ability.Element | null;
  /** If filter is applied, which effect type is displayed. */
  effects: Teriock.Parameters.Ability.EffectTag | null;
  /** If filter is applied, which delivery is displayed. */
  delivery: Teriock.Parameters.Ability.Delivery | null;
  /** If filter is applied, which piercing type is displayed. */
  piercing: string | null;
  /** If filter is applied, which target is displayed. */
  target: Teriock.Parameters.Ability.Target | null;
}

/**
 * Filters to change what equipment is displayed.
 */
export interface EquipmentFilters {
  /** Currently applied search term. */
  search: string;
  /** Show, hide, or don't filter based on if equipped. */
  equipped: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if shattered. */
  shattered: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if consumable. */
  consumable: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if identified. */
  identified: Teriock.UI.ThreeToggle;
  /** If filter is applied, which property is displayed. */
  properties: Teriock.Parameters.Equipment.GenericPropertyKey | null;
  /** If filter is applied, which material property is displayed. */
  materialProperties: Teriock.Parameters.Equipment.MaterialPropertyKey | null;
  /** If filter is applied, which magical property is displayed. */
  magicalProperties: Teriock.Parameters.Equipment.MagicalPropertyKey | null;
  /** If filter is applied, which weapon fighting style is displayed. */
  weaponFightingStyles: Teriock.Parameters.Equipment.WeaponFightingStyle | null;
  /** If filter is applied, which equipment class is displayed. */
  equipmentClasses: Teriock.Parameters.Equipment.EquipmentClass | null;
  /** If filter is applied, which power level is displayed. */
  powerLevel: string | null;
}
