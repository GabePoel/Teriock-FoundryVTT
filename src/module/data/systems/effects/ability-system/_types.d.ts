declare global {
  namespace Teriock.Models {
    export interface AbilitySystemData extends Teriock.Models.BaseEffectSystemData {
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.DocumentSettingsModelInstance<"ability">;

      get parent(): TeriockAbility;
    }
  }
}

export {};
