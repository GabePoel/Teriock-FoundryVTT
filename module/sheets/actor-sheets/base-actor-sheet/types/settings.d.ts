import { ThreeToggle } from "../../../../types/ui";

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
    /** Show rank options menu. */
    rankOptions: boolean;
    /** Show power options menu. */
    powerOptions: boolean;
    /** Show effect options menu. */
    effectOptions: boolean;
  };

  /**
   * Filters to change what abilities are displayed.
   */
  abilityFilters: {
    /** Currently applied search term. */
    search: string;
    /** Show, hide, or don't filter based on if basic. */
    basic: ThreeToggle;
    /** Show, hide, or don't filter based on if standard. */
    standard: ThreeToggle;
    /** Show, hide, or don't filter based on if a skill. */
    skill: ThreeToggle;
    /** Show, hide, or don't filter based on if a spell. */
    spell: ThreeToggle;
    /** Show, hide, or don't filter based on if a ritual. */
    ritual: ThreeToggle;
    /** Show, hide, or don't filter based on if a rotator. */
    rotator: ThreeToggle;
    /** Show, hide, or don't filter based on if verbal cost. */
    verbal: ThreeToggle;
    /** Show, hide, or don't filter based on if somatic cost. */
    somatic: ThreeToggle;
    /** Show, hide, or don't filter based on if material cost. */
    material: ThreeToggle;
    /** Show, hide, or don't filter based on if invoked. */
    invoked: ThreeToggle;
    /** Show, hide, or don't filter based on if sustained. */
    sustained: ThreeToggle;
    /** Show, hide, or don't filter based on if break cost. */
    broken: ThreeToggle;
    /** Show, hide, or don't filter based on if HP cost. */
    hp: ThreeToggle;
    /** Show, hide, or don't filter based on if MP cost. */
    mp: ThreeToggle;
    /** Show, hide, or don't filter based on if heightenable. */
    heightened: ThreeToggle;
    /** Show, hide, or don't filter based on if expansion. */
    expansion: ThreeToggle;
    /** If filter is applied, which maneuver is displayed. */
    maneuver: string | null;
    /** If filter is applied, which interaction is displayed. */
    interaction: string | null;
    /** If filter is applied, which power source type is displayed. */
    powerSource: string | null;
    /** If filter is applied, which element is displayed. */
    element: string | null;
    /** If filter is applied, which effect type is displayed. */
    effects: string | null;
  };

  /**
   * Filters to change what equipment is displayed.
   */
  equipmentFilters: {
    /** Currently applied search term. */
    search: string;
    /** Show, hide, or don't filter based on if equipped. */
    equipped: ThreeToggle;
    /** Show, hide, or don't filter based on if shattered. */
    shattered: ThreeToggle;
    /** Show, hide, or don't filter based on if consumable. */
    consumable: ThreeToggle;
    /** Show, hide, or don't filter based on if identified. */
    identified: ThreeToggle;
    /** If filter is applied, which property is displayed. */
    properties: string | null;
    /** If filter is applied, which material property is displayed. */
    materialProperties: string | null;
    /** If filter is applied, which magical property is displayed. */
    magicalProperties: string | null;
    /** If filter is applied, which weapon fighting style is displayed. */
    weaponFightingStyles: string | null;
    /** If filter is applied, which equipment class is displayed. */
    equipmentClasses: string | null;
    /** If filter is applied, which power level is displayed. */
    powerLevel: string | null;
  };

  /** Key used to determine how abilities are sorted. */
  abilitySortOption: string;

  /** Ability sort direction. */
  abilitySortAscending: boolean;

  /** Key used to determine how equipment are sorted. */
  equipmentSortOption: string;

  /** Equipment sort direction. */
  equipmentSortAscending: boolean;

  /** Whether the rules text for a given condition is expanded or collapsed. */
  conditionExpansions: Record<string, boolean>;
}
