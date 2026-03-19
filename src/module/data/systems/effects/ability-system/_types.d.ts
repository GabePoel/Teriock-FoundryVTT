import "./parts/_types";
import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface AbilitySystemData
      extends Teriock.Models.BaseEffectSystemData {
      get parent(): TeriockAbility;
    }
  }
}
