declare module "./ability-preview-model.mjs" {
  export default interface AbilityPreviewModel {
    filters: Teriock.Models.MetaphysicsFilters & {
      basic: boolean | null;
      costs: {
        components: Record<Teriock.Keys.Component, boolean | null>;
        primary: Record<Teriock.Keys.Stat, boolean | null>;
        tweaks: Record<Teriock.Keys.CostTweak, boolean | null>;
      };
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
  }
}

export {};
