declare module "./ability-system.mjs" {
  export default interface AbilitySystem extends Teriock.Models.BaseEffectSystemData {
    /** <schema> Per-document behavior and display settings */
    settings: Teriock.Models.DocumentSettingsModelInstance<"ability">;
  }
}

export {};
