import { toTitleCase } from "../helpers/string.mjs";

export function registerSettings() {
  /** @type {Record<string, Partial<SettingConfig>>} */
  const settings = {
    rollAttackOnEquipmentUse: {
      config: true,
      default: false,
      hint: "If enabled, using equipment will automatically roll Basic Attack.",
      name: "Roll Attack on Equipment Use",
      scope: "user",
      type: Boolean,
    },
    developerMode: {
      config: true,
      default: false,
      hint:
        "Check this if you are a developer of the Teriock system and need additional features. Do not check this " +
        "otherwise. It is likely to break your game. Even module developers shouldn't check this.",
      name: "Developer Mode",
      scope: "world",
      type: Boolean,
    },
  };
  const quickIndexDefaults = {
    abilities: true,
    equipment: false,
    properties: false,
    species: true,
  };
  for (const [title, initial] of Object.entries(quickIndexDefaults)) {
    settings[`quickIndex${toTitleCase(title)}`] = {
      name: `Quickly Index ${toTitleCase(title)}`,
      hint: `If enabled, the window to import ${title.toLowerCase()} is loaded quickly but no tooltips are displayed.`,
      scope: "client",
      config: true,
      type: Boolean,
      default: initial,
    };
  }
  for (const [key, data] of Object.entries(settings)) {
    game.settings.register("teriock", key, data);
  }
}
