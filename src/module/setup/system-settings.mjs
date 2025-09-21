import { toTitleCase } from "../helpers/string.mjs";

export function registerSettings() {
  /** @type {Record<string, Partial<SettingConfig>>} */
  const settings = {
    developerMode: {
      name: "Developer Mode",
      hint: "Check this if you are a developer of the Teriock system and need additional features. Do not check this "
        + "otherwise. It is likely to break your game. Even module developers shouldn't check this.",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    }
  };
  const quickIndexDefaults = {
    abilities: true,
    equipment: false,
    properties: false,
    species: true,
  };
  for (const [ title, initial ] of Object.entries(quickIndexDefaults)) {
    settings[`quickIndex${toTitleCase(title)}`] = {
      name: `Quickly Index ${toTitleCase(title)}`,
      hint: `If enabled, the window to import ${title.toLowerCase()} is loaded quickly but no tooltips are displayed.`,
      scope: "client",
      config: true,
      type: Boolean,
      default: initial,
    };
  }
  for (const [ key, data ] of Object.entries(settings)) {
    game.settings.register("teriock", key, data);
  }
}
