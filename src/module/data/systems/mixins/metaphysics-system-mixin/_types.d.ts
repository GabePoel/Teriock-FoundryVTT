declare global {
  namespace Teriock.Models {
    export type MetaphysicsSystemData = {
      /**
       * <schema> Tags that describe what type of effect this is
       * ("effect" in the Teriock rules sense, not in the Foundry VTT sense)
       */
      effectTypes: Set<Teriock.Keys.EffectType>;
      /** <schema> Elements of this */
      elements: Set<Teriock.Keys.Element>;
      /** <schema> Power sources that must be available in order for this to work */
      powerSources: Set<Teriock.Keys.PowerSource>;
    };
  }
}

export {};
