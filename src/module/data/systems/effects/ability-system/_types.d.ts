import "./parts/_types";
import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface AbilitySystemInterface
      extends Teriock.Models.BaseEffectSystemInterface {
      get parent(): TeriockAbility;
    }
  }
}
