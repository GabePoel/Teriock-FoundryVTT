import { toTitleCase } from "../helpers/string.mjs";

export function registerSettings() {
  //noinspection JSValidateJSDoc
  /** @type {Record<string, Partial<SettingConfig>>} */
  const settings = {
    automaticallyPayAbilityCosts: {
      config: true,
      default: true,
      hint: "If enabled, HP, MP, and GP costs of abilities will be paid automatically upon use.",
      name: "Automatically Pay Ability Costs",
      scope: "user",
      type: Boolean,
    },
    automaticallyChangeVisionModes: {
      config: true,
      default: true,
      hint: "If enabled, vision modes will automatically be changed based on abilities and down state.",
      name: "Automatically Change Vision Modes",
      scope: "user",
      type: Boolean,
    },
    defaultPanelCollapseState: {
      config: true,
      default: "auto",
      hint: "Default state for chat message panels.",
      name: "Default Panel Collapse State",
      scope: "user",
      type: String,
      choices: {
        auto: "Automatic",
        closed: "Closed",
        open: "Open",
      },
    },
    automaticPanelCollapseTime: {
      config: true,
      default: 5,
      hint: "Automatically collapse chat message panels older than this many minutes.",
      name: "Automatic Panel Collapse Time",
      scope: "user",
      type: Number,
    },
    placeTemplateOnAbilityUse: {
      config: true,
      default: true,
      hint: "If enabled, using abilities with an area of effect will automatically place a measured template.",
      name: "Place Template on Ability Use",
      scope: "user",
      type: Boolean,
    },
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
    gmDocumentNotesJournalName: {
      config: true,
      default: "GM Document Notes",
      hint: "Name of the journal entry that linked document notes will automatically be added to.",
      name: "GM Document Notes Journal Name",
      scope: "world",
      type: String,
    },
  };
  const quickIndexDefaults = {
    abilities: true,
    equipment: true,
    properties: true,
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
