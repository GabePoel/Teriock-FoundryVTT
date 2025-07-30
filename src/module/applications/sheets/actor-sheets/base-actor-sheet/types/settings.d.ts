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
  conditionExpansions: Record<Teriock.ConditionKey, boolean>;
}

/**
 * Filters to change what abilities are displayed.
 */
export interface AbilityFilters {
  /** Currently applied search term. */
  search: string;
  /** Show, hide, or don't filter based on if basic. */
  basic: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if standard. */
  standard: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if a skill. */
  skill: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if a spell. */
  spell: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if a ritual. */
  ritual: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if a rotator. */
  rotator: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if verbal cost. */
  verbal: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if somatic cost. */
  somatic: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if material cost. */
  material: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if invoked. */
  invoked: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if sustained. */
  sustained: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if break cost. */
  broken: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if HP cost. */
  hp: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if MP cost. */
  mp: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if heightenable. */
  heightened: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if expansion. */
  expansion: Teriock.ThreeToggle;
  /** If filter is applied, which maneuver is displayed. */
  maneuver: Teriock.Maneuver | null;
  /** If filter is applied, which interaction is displayed. */
  interaction: Teriock.Interaction | null;
  /** If filter is applied, which power source type is displayed. */
  powerSource: Teriock.PowerSource | null;
  /** If filter is applied, which element is displayed. */
  element: Teriock.Element | null;
  /** If filter is applied, which effect type is displayed. */
  effects: Teriock.EffectTag | null;
  /** If filter is applied, which delivery is displayed. */
  delivery: Teriock.Delivery | null;
  /** If filter is applied, which piercing type is displayed. */
  piercing: string | null;
  /** If filter is applied, which target is displayed. */
  target: Teriock.Target | null;
}

/**
 * Filters to change what equipment is displayed.
 */
export interface EquipmentFilters {
  /** Currently applied search term. */
  search: string;
  /** Show, hide, or don't filter based on if equipped. */
  equipped: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if shattered. */
  shattered: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if consumable. */
  consumable: Teriock.ThreeToggle;
  /** Show, hide, or don't filter based on if identified. */
  identified: Teriock.ThreeToggle;
  /** If filter is applied, which property is displayed. */
  properties: Teriock.GenericPropertyKey | null;
  /** If filter is applied, which material property is displayed. */
  materialProperties: Teriock.MaterialPropertyKey | null;
  /** If filter is applied, which magical property is displayed. */
  magicalProperties: Teriock.MagicalPropertyKey | null;
  /** If filter is applied, which weapon fighting style is displayed. */
  weaponFightingStyles: Teriock.WeaponFightingStyle | null;
  /** If filter is applied, which equipment class is displayed. */
  equipmentClasses: Teriock.EquipmentClass | null;
  /** If filter is applied, which power level is displayed. */
  powerLevel: string | null;
}
