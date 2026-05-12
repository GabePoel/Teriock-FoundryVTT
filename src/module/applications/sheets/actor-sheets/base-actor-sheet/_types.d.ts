declare global {
  namespace Teriock.Sheet {
    /** Actor sheet display settings */
    export type BaseActorSheetSettings = {
      /** Filters to change what abilities are displayed */
      abilityFilters: AbilityFilters;
      /** Ability sort direction */
      abilitySortAscending: boolean;
      /** Key used to determine how abilities are sorted */
      abilitySortOption: string;
      /** Path used for avatar image */
      avatarImagePath: string;
      /** Whether the rules text for a given condition is expanded or collapsed */
      conditionExpansions: Partial<Record<Teriock.Keys.Condition, boolean>>;
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
      /** If the filter is applied, which delivery is displayed */
      delivery: Teriock.Keys.Delivery | null;
      /** If the filter is applied, which effect type is displayed */
      effectTypes: Teriock.Keys.EffectType | null;
      /** If the filter is applied, which element is displayed */
      element: Teriock.Keys.Element | null;
      /** Show, hide, or don't filter based on if expansion */
      expansion: Teriock.UI.ThreeToggle;
      /** Show, hide, or don't filter based on if GP cost */
      gp: Teriock.UI.ThreeToggle;
      /** Show, hide, or don't filter based on if heightenable */
      heightened: Teriock.UI.ThreeToggle;
      /** Show, hide, or don't filter based on if HP cost */
      hp: Teriock.UI.ThreeToggle;
      /** If the filter is applied, which interaction is displayed */
      interaction: Teriock.Keys.Interaction | null;
      /** Show, hide, or don't filter based on if invoked */
      invoked: Teriock.UI.ThreeToggle;
      /** If the filter is applied, which maneuver is displayed */
      maneuver: Teriock.Keys.Maneuver | null;
      /** Show, hide, or don't filter based on if material cost */
      material: Teriock.UI.ThreeToggle;
      /** Show, hide, or don't filter based on if MP cost */
      mp: Teriock.UI.ThreeToggle;
      /** If the filter is applied, which piercing type is displayed */
      piercing: Teriock.System.PiercingLevel | null;
      /** If the filter is applied, which power source type is displayed */
      powerSource: Teriock.Keys.PowerSource | null;
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
      target: Teriock.Keys.Target | null;
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
      equipmentClasses: Teriock.Keys.EquipmentClass | null;
      /** Show, hide, or don't filter based on if equipped */
      equipped: Teriock.UI.ThreeToggle;
      /** Show, hide, or don't filter based on if identified */
      identified: Teriock.UI.ThreeToggle;
      /** If the filter is applied, which magical property is displayed */
      magicalProperties: Teriock.Keys.MagicalProperty | null;
      /** If the filter is applied, which material property is displayed */
      materialProperties: Teriock.Keys.MaterialProperty | null;
      /** If the filter is applied, which power level is displayed */
      powerLevel: string | null;
      /** If the filter is applied, which property is displayed */
      properties: Teriock.Keys.Property | null;
      /** Currently applied search term */
      search: string;
      /** Show, hide, or don't filter based on if shattered */
      shattered: Teriock.UI.ThreeToggle;
      /** If the filter is applied, which weapon fighting style is displayed */
      weaponFightingStyles: Teriock.Keys.WeaponFightingStyle | null;
    };
  }
}

export {};
