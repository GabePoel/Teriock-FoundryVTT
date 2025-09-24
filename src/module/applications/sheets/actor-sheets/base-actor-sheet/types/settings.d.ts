/** Actor sheet display settings */
export type BaseActorSheetSettings = {
  /** Filters to change what abilities are displayed */
  abilityFilters: AbilityFilters;
  /** Ability sort direction */
  abilitySortAscending: boolean;
  /** Key used to determine how abilities are sorted */
  abilitySortOption: string;
  /** Whether the rules text for a given condition is expanded or collapsed */
  conditionExpansions: Record<
    Teriock.Parameters.Condition.ConditionKey,
    boolean
  >;
  /** Filters to change what equipment is displayed */
  equipmentFilters: EquipmentFilters;
  /** Equipment sort direction */
  equipmentSortAscending: boolean;
  /** Key used to determine how equipment is sorted */
  equipmentSortOption: string;
  /** Menus that can be displayed for each page */
  menus: {
    /** Show ability filters menu */
    abilityFilters: boolean;
    /** Show the ability options menu */
    abilityOptions: boolean;
    /** Show the ability sort menu */
    abilitySort: boolean;
    /** Show the effect options menu */
    consequenceOptions: boolean;
    /** Show the equipment filters menu */
    equipmentFilters: boolean;
    /** Show the equipment options menu */
    equipmentOptions: boolean;
    /** Show the equipment sort menu */
    equipmentSort: boolean;
    /** Show the fluency options menu */
    fluencyOptions: boolean;
    /** Show the power options' menu */
    powerOptions: boolean;
    /** Show the rank options' menu */
    rankOptions: boolean;
    /** Show the resource options menu */
    resourceOptions: boolean;
  };
};

/**
 * Filters to change what abilities are displayed.
 */
export type AbilityFilters = {
  /** Show, hide, or don't filter based on if basic */
  basic: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if break cost */
  broken: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which delivery is displayed */
  delivery: Teriock.Parameters.Ability.Delivery | null;
  /** If the filter is applied, which effect type is displayed */
  effectTypes: Teriock.Parameters.Ability.EffectTag | null;
  /** If the filter is applied, which element is displayed */
  element: Teriock.Parameters.Ability.Element | null;
  /** Show, hide, or don't filter based on if expansion */
  expansion: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if heightenable */
  heightened: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if HP cost */
  hp: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which interaction is displayed */
  interaction: Teriock.Parameters.Ability.Interaction | null;
  /** Show, hide, or don't filter based on if invoked */
  invoked: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which maneuver is displayed */
  maneuver: Teriock.Parameters.Ability.Maneuver | null;
  /** Show, hide, or don't filter based on if material cost */
  material: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if MP cost */
  mp: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which piercing type is displayed */
  piercing: string | null;
  /** If the filter is applied, which power source type is displayed */
  powerSource: Teriock.Parameters.Ability.PowerSource | null;
  /** Show, hide, or don't filter based on if a ritual */
  ritual: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a rotator */
  rotator: Teriock.UI.ThreeToggle;
  /** Currently applied search term */
  search: string;
  /** Show, hide, or don't filter based on if a skill */
  skill: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if somatic cost */
  somatic: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if a spell */
  spell: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if standard */
  standard: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if sustained */
  sustained: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which target is displayed */
  target: Teriock.Parameters.Ability.Target | null;
  /** Show, hide, or don't filter based on if verbal cost */
  verbal: Teriock.UI.ThreeToggle;
};

/**
 * Filters to change what equipment is displayed.
 */
export type EquipmentFilters = {
  /** Show, hide, or don't filter based on if consumable */
  consumable: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which equipment class is displayed */
  equipmentClasses: Teriock.Parameters.Equipment.EquipmentClass | null;
  /** Show, hide, or don't filter based on if equipped */
  equipped: Teriock.UI.ThreeToggle;
  /** Show, hide, or don't filter based on if identified */
  identified: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which magical property is displayed */
  magicalProperties: Teriock.Parameters.Equipment.MagicalPropertyKey | null;
  /** If the filter is applied, which material property is displayed */
  materialProperties: Teriock.Parameters.Equipment.MaterialPropertyKey | null;
  /** If the filter is applied, which power level is displayed */
  powerLevel: string | null;
  /** If the filter is applied, which property is displayed */
  properties: Teriock.Parameters.Equipment.PropertyKey | null;
  /** Currently applied search term */
  search: string;
  /** Show, hide, or don't filter based on if shattered */
  shattered: Teriock.UI.ThreeToggle;
  /** If the filter is applied, which weapon fighting style is displayed */
  weaponFightingStyles: Teriock.Parameters.Equipment.WeaponFightingStyle | null;
};
