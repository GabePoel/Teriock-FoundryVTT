import * as menus from "../applications/menus/_module.mjs";
import attributeConfig from "../constants/config/attribute-config.mjs";
import dieConfig from "../constants/config/death-bag-config.mjs";
import documentConfig from "../constants/config/document-config.mjs";
import settingsConfig from "../constants/config/settings-config.mjs";
import tipConfig from "../constants/config/tip-config.mjs";
import { InfiniteNumberField, TypedIdentifierSetField } from "../data/fields/_module.mjs";
import { tradecraftsField } from "../data/fields/tools/builders.mjs";
import { userSettingsModels } from "../data/models/settings-models/_module.mjs";
import * as documents from "../documents/_module.mjs";
import { objectMap } from "../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @import { SettingConfig } from "@client/_types.mjs";
 */

/**
 * Give each setting its `TERIOCK.SETTINGS.<key>` name and hint.
 * @template {Record<string, Partial<SettingConfig>>} T
 * @param {T} group
 * @returns {T}
 */
function localizeSettings(group) {
  for (const [key, definition] of Object.entries(group)) {
    definition.name ??= `TERIOCK.SETTINGS.${key}.name`;
    definition.hint ??= `TERIOCK.SETTINGS.${key}.hint`;
  }
  return group;
}

/**
 * Apply {@link localizeSettings} to every category.
 * @template {Record<string, Record<string, Partial<SettingConfig>>>} T
 * @param {T} categories
 * @returns {T}
 */
function localizeSettingCategories(categories) {
  for (const group of Object.values(categories)) { localizeSettings(group); }
  return categories;
}

/** @type {Record<Teriock.Config.SettingsCategory, SettingConfig>} */
export const inheritedSettings = localizeSettings(
  Object.fromEntries(
    Object.keys(settingsConfig.categories).map(
      category => [category, {
        default: settingsConfig.categories[category],
        scope: "user",
        type: userSettingsModels[category],
      }]
    ),
  ),
);

export const settings = localizeSettingCategories({
  actorSheet: {
    floatingActorTabs: { default: true, requiresReload: true, scope: "client", type: Boolean },
    highlightModifiedValues: { default: false, requiresReload: true, scope: "client", type: Boolean },
  },
  armor: {
    armorSuppressesRanks: { default: false, scope: "world", type: Boolean },
    armorWeakensRanks: { default: false, scope: "world", type: Boolean },
  },
  chat: {
    autoPanelCollapseTime: { default: 5, scope: "client", type: new InfiniteNumberField() },
    autoTriggerDeleteTime: { default: 5, scope: "client", type: new InfiniteNumberField() },
    defaultPanelCollapseState: {
      choices: {
        auto: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.auto",
        closed: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.closed",
        open: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.open",
      },
      default: "auto",
      scope: "client",
      type: String,
    },
    openPanelContextMenuEntry: { default: true, scope: "client", type: Boolean },
  },
  compendiumPriority: {
    identifierSourcePriority: {
      default: {
        "teriock.abilities": 11,
        "teriock.bodyParts": 9,
        "teriock.classes": 7,
        "teriock.creatures": 5,
        "teriock.equipment": 8,
        "teriock.essentials": 3,
        "teriock.magicItems": 1,
        "teriock.powers": 2,
        "teriock.properties": 10,
        "teriock.rules": 12,
        "teriock.species": 6,
        "teriock.templateEffects": 4,
      },
      requiresReload: true,
      scope: "world",
      type: new fields.TypedObjectField(new fields.NumberField(), { expandKeys: false }),
    },
  },
  cone: {
    defaultConeAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
    defaultDragonBreathAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
  },
  developer: {
    developerMode: { default: false, scope: "world", type: Boolean },
    dontDropUuidsInTables: { default: false, scope: "world", type: Boolean },
  },
  dialog: {
    confirmStatDiceRerolls: { default: true, scope: "user", type: Boolean },
    selectAddedDocuments: { default: true, scope: "user", type: Boolean },
    showRollDialogs: { default: true, scope: "user", type: Boolean },
  },
  dragDrop: {
    maximizeApplicationsOnDragEnter: { default: true, scope: "client", type: Boolean },
    minimizeApplicationsOnDragStart: { default: true, scope: "client", type: Boolean },
  },
  error: {
    errorMessages: {
      default: Object.keys(tipConfig.error),
      requiresReload: true,
      scope: "client",
      type: new fields.SetField(new fields.StringField({ choices: tipConfig.error }), {
        initial: Object.keys(tipConfig.error),
      }),
    },
    showErrorTipsOnSheets: { default: true, requiresReload: true, scope: "client", type: Boolean },
    showErrorTipsOnTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
  },
  gameMasterControls: {
    deathBagStoneColors: {
      default: Object.keys(dieConfig.stones).filter(k => dieConfig.stones[k].initial),
      scope: "world",
      type: new fields.SetField(new fields.StringField({ choices: objectMap(dieConfig.stones, (c) => c.label) })),
    },
    nonHierarchicalChanges: { default: true, requiresReload: true, scope: "world", type: Boolean },
    openChatDocuments: { default: false, scope: "world", type: Boolean },
    openChatImages: { default: true, scope: "world", type: Boolean },
    playerMacrosFolderName: { default: "Player Macros", scope: "world", type: String },
    sortNewPlayerMacros: { default: true, scope: "world", type: Boolean },
    trackSustainedConsequences: { default: true, scope: "world", type: Boolean },
    triggerFireScope: {
      choices: {
        default: "TERIOCK.SETTINGS.triggerFireScope.choices.default",
        gm: "TERIOCK.SETTINGS.triggerFireScope.choices.gm",
        owners: "TERIOCK.SETTINGS.triggerFireScope.choices.owners",
      },
      default: "default",
      scope: "world",
      type: String,
    },
    triggerMessageMode: {
      default: "self",
      scope: "world",
      type: new fields.StringField({
        choices: objectMap(CONFIG.ChatMessage.modes, (c) => c.label),
        initial: "self",
        nullable: false,
      }),
    },
  },
  generalDisplay: {
    openConditionsAsJournalEntryPages: { default: true, scope: "user", type: Boolean },
    styleDice: { default: true, scope: "client", type: Boolean },
    unlockSheetsByDefault: { default: false, scope: "user", type: Boolean },
  },
  secrets: {
    deathBagMessageMode: {
      default: null,
      scope: "world",
      type: new fields.StringField({
        blank: true,
        choices: objectMap(CONFIG.ChatMessage.modes, (c) => c.label, { none: true }),
        initial: null,
        nullable: true,
      }),
    },
    secretAttributes: {
      default: [],
      scope: "world",
      type: new fields.SetField(new fields.StringField({ choices: objectMap(attributeConfig, (c) => c.label) })),
    },
    secretDocuments: { default: [], scope: "world", type: new TypedIdentifierSetField() },
    secretTradecrafts: { default: [], scope: "world", type: tradecraftsField() },
    showPrivateTradecraftDiceRolls: { default: true, scope: "world", type: Boolean },
  },
  suppression: {
    showSuppressionTipsOnSheets: { default: true, requiresReload: true, scope: "client", type: Boolean },
    showSuppressionTipsOnTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
    suppressionMessages: {
      default: Object.keys(tipConfig.suppression),
      requiresReload: true,
      scope: "client",
      type: new fields.SetField(new fields.StringField({ choices: tipConfig.suppression }), {
        initial: Object.keys(tipConfig.suppression),
      }),
    },
    suppressionMessageTypes: {
      default: Object.entries(documentConfig).filter(([_k, v]) => ["ActiveEffect", "Item"].includes(v.documentName))
        .map(([k, _v]) =>
          k
        ),
      requiresReload: true,
      scope: "client",
      type: new fields.SetField(
        new fields.StringField({
          choices: objectMap(documentConfig, (v) => v.label, {
            filter: v => ["ActiveEffect", "Item"].includes(v.documentName),
          }),
        }),
        {
          initial: Object.entries(documentConfig).filter(([_k, v]) => ["ActiveEffect", "Item"].includes(v.documentName))
            .map(([k, _v]) => k),
        },
      ),
    },
  },
  tooltip: {
    compendiumTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
    contentLinkTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
    documentTooltips: {
      default: Object.values(documents).filter((d) =>
        foundry.utils.isSubclass(d, foundry.abstract.Document) && d.documentMetadata?.tooltip
      ).map(d => d.documentName),
      requiresReload: true,
      scope: "client",
      type: new fields.SetField(
        new fields.StringField({
          choices: Object.fromEntries(
            Object.values(documents).filter((d) =>
              foundry.utils.isSubclass(d, foundry.abstract.Document) && d.documentMetadata?.tooltip
            ).map(d => d.documentName).map(n => [n, `DOCUMENT.${n}`]),
          ),
        }),
      ),
    },
    sidebarTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
  },
});

/**
 * Register all settings and setting menus.
 */
export function registerSettings() {
  menus.DocumentBehaviorMenu.registerMenu();
  menus.AlternateRulesMenu.registerMenu();
  menus.DialogMenu.registerMenu();
  menus.DisplayMenu.registerMenu();
  menus.TipsMenu.registerMenu();
  menus.CompendiumPriorityMenu.registerMenu();
  menus.GameMasterControlsMenu.registerMenu();
  for (const [k, d] of Object.entries(inheritedSettings)) { game.settings.register("teriock", k, d); }
  for (const s of Object.values(settings)) {
    for (const [k, d] of Object.entries(s)) { game.settings.register("teriock", k, d); }
  }
}
