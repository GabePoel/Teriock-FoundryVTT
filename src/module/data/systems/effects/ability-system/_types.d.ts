declare module "./ability-system.mjs" {
  export default interface AbilitySystem {
    /** <schema> Per-document behavior and display settings */
    settings: Teriock.Models.DocumentSettingsModelInstance<"ability">;
  }
}

export {};
