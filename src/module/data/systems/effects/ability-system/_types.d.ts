import "./parts/_types";

declare global {
  namespace Teriock.Models {
    export interface AbilitySystemData
      extends Teriock.Models.BaseEffectSystemData {
      get parent(): TeriockAbility;
    }
  }
}
