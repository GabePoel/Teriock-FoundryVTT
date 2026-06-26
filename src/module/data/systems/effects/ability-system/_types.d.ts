import "./parts/_types";

declare global {
  namespace Teriock.Models {
    export interface AbilitySystemData extends Teriock.Models.BaseEffectSystemData {
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.AbilitySettingsModel;

      get parent(): TeriockAbility;
    }
  }
}
