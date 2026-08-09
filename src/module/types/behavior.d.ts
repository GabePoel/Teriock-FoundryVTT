import documentBehaviorConfig from "../constants/config/document-behavior-config.mjs";

declare global {
  namespace Teriock.Behavior {
    export type SettingsConfig = typeof documentBehaviorConfig;

    export type SettingsCategory = keyof SettingsConfig["categories"];

    export type SettingsKey<Category extends SettingsCategory = SettingsCategory> =
      & keyof SettingsConfig["categories"][Category]["settings"]
      & string;

    export interface SettingsCompositionMap {
      ability: "ability" | "consumable";
      actor: "actor";
      armament: "armament";
      consumable: "consumable";
      equipment: "armament" | "consumable" | "equipment";
    }

    export type DocumentSettingsCategory = keyof SettingsCompositionMap;

    export type ComposedSettingsKey<Category extends DocumentSettingsCategory = DocumentSettingsCategory> =
      SettingsCompositionMap[Category] extends infer Group extends SettingsCategory
        ? Group extends SettingsCategory ? SettingsKey<Group> : never
        : never;
  }
}

export {};
