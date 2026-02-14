declare global {
  namespace Teriock.Models {
    export interface AbilityTagsPartInterface {
      /**
       * <schema> Tags that describe what type of effect this ability is
       * ("effect" in the Teriock rules sense, not in the Foundry VTT sense)
       */
      effectTypes: Set<Teriock.Parameters.Ability.EffectTag>;
      /** <schema> Elements of this ability */
      elements: Set<Teriock.Parameters.Ability.Element>;
      /** <schema> The "form" of this ability (what color it would be printed on a card) */
      form: Teriock.Parameters.Shared.Form;
      /** <schema> Power sources that must be available in order for this ability to work */
      powerSources: Set<Teriock.Parameters.Ability.PowerSource>;
    }
  }
}

export {};
