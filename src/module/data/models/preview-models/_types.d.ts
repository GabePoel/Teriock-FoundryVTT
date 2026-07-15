declare global {
  namespace Teriock.Models {
    export type PreviewDisplay = { gapless: boolean, size: Teriock.Keys.CardDisplaySize };

    export type PreviewSort = { ascending: boolean, option: string };

    export type BaseFilters = {
      active: boolean | null;
      children: boolean | null;
      duplicates: boolean | null;
      fluent: boolean | null;
      proficient: boolean | null;
    };

    export type AffinityFilters = {
      category: Teriock.Keys.AffinityCategory | null;
      protection: boolean | null;
      type: Teriock.Affinities.Type | null;
      weakness: boolean | null;
    };

    export type CostFilters = {
      components: Record<Teriock.Keys.Component, boolean | null>;
      primary: Record<Teriock.Keys.Stat, boolean | null>;
      tweaks: Record<Teriock.Keys.CostTweak, boolean | null>;
    };

    export type MetaphysicsFilters = BaseFilters & {
      effectType: Teriock.Keys.EffectType | null;
      element: Teriock.Keys.Element | null;
      form: Teriock.Keys.Form | null;
      powerSource: Teriock.Keys.PowerSource | null;
    };

    export type AbilityFilters = MetaphysicsFilters & {
      basic: boolean | null;
      costs: CostFilters;
      delivery: Teriock.Keys.Delivery | null;
      expansion: Teriock.Keys.Expansion | null;
      heightened: boolean | null;
      interaction: Teriock.Keys.Interaction | null;
      invoked: boolean | null;
      maneuver: Teriock.Keys.Maneuver | null;
      ritual: boolean | null;
      rotator: boolean | null;
      skill: boolean | null;
      spell: boolean | null;
      standard: boolean | null;
      sustained: boolean | null;
      target: Teriock.Keys.Target | null;
    };

    export type EquipmentFilters = BaseFilters & {
      attuned: boolean | null;
      consumable: boolean | null;
      equipmentClasses: Teriock.Keys.EquipmentClass | null;
      equipped: boolean | null;
      identified: boolean | null;
      powerLevel: Teriock.Keys.PowerLevel | null;
      properties: string | null;
      weaponFightingStyles: string | null;
    };

    export type FluencyFilters = BaseFilters & {
      field: Teriock.Keys.Field | null;
      tradecraft: Teriock.Keys.Tradecraft | null;
    };

    export type PowerFilters = BaseFilters & { type: Teriock.Keys.PowerType | null };

    export type PropertyFilters = MetaphysicsFilters & {
      applyIfDampened: boolean | null;
      applyIfDeattuned: boolean | null;
      applyIfShattered: boolean | null;
      applyIfUnequipped: boolean | null;
      consumable: boolean | null;
    };

    export type RankFilters = BaseFilters & {
      archetype: Teriock.Keys.Archetype | null;
      class: Teriock.Keys.Class | null;
      innate: boolean | null;
    };
  }
}

export {};
