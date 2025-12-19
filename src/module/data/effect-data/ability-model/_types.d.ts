declare global {
  namespace Teriock.Models {
    export interface TeriockAbilityModelInterface
      extends Teriock.Models.TeriockBaseEffectModelInterface {
      get parent(): TeriockAbility;
    }
  }
}

export {};
