declare module "./metaphysics-preview-model.mjs" {
  export default interface MetaphysicsPreviewModel {
    filters: Teriock.Models.MetaphysicsFilters;
  }
}

declare global {
  namespace Teriock.Models {
    export type MetaphysicsFilters = Teriock.Models.BaseFilters & {
      effectType: Teriock.Keys.EffectType | null;
      element: Teriock.Keys.Element | null;
      kind: Teriock.Keys.EffectKind | null;
      powerSource: Teriock.Keys.PowerSource | null;
    };
  }
}

export {};
