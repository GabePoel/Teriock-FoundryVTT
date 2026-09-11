import { CompendiumPriorityMenu, MenuFactory } from "../applications/menus/_module.mjs";
import attributeConfig from "../constants/config/attribute-config.mjs";
import dieConfig from "../constants/config/death-bag-config.mjs";
import documentBehaviorConfig from "../constants/config/document-behavior-config.mjs";
import documentConfig from "../constants/config/document-config.mjs";
import tipConfig from "../constants/config/tip-config.mjs";
import { icons } from "../constants/display/_module.mjs";
import { InfiniteNumberField, TypedIdentifierSetField } from "../data/fields/_module.mjs";
import { tradecraftsField } from "../data/fields/tools/builders.mjs";
import { userSettingsModels } from "../data/models/settings-models/_module.mjs";
import * as documents from "../documents/_module.mjs";
import { objectMap } from "../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Every system setting.
 * @type {Record<string, Teriock.Settings.MenuEntry>}
 */
export const menus = {
  alternateRules: {
    groups: {
      armor: {
        icon: icons.manifest.target.armor,
        settings: {
          armorSuppressesRanks: { default: false, scope: "world", type: Boolean },
          armorWeakensRanks: { default: false, scope: "world", type: Boolean },
        },
      },
      cone: {
        icon: icons.manifest.delivery.cone,
        settings: {
          defaultConeAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
          defaultDragonBreathAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
        },
      },
      keyword: {
        icon: icons.manifest.document.keyword,
        settings: { randomBoostedTypes: { default: false, scope: "world", type: Boolean } },
      },
    },
    icon: icons.manifest.settings.alternateRules,
  },
  compendiumPriority: {
    application: CompendiumPriorityMenu,
    groups: {
      identifierSources: {
        settings: {
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
        template: "teriock/menus/compendium-priority-menu",
      },
    },
    icon: icons.manifest.ui.compendium,
  },
  dialog: {
    groups: {
      general: {
        settings: {
          confirmStatDiceRerolls: { default: true, scope: "user", type: Boolean },
          selectAddedDocuments: { default: true, scope: "user", type: Boolean },
          showRollDialogs: { default: true, scope: "user", type: Boolean },
        },
      },
    },
    icon: icons.manifest.settings.dialog,
  },
  display: {
    format: "tabs",
    groups: {
      actorSheet: {
        icon: icons.manifest.ui.actorSheet,
        settings: {
          floatingActorTabs: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ actors: true }),
          },
          highlightModifiedValues: {
            default: false,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ actors: true }),
          },
        },
      },
      chat: {
        icon: icons.manifest.ui.chat,
        settings: {
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
      },
      dragDrop: {
        icon: icons.manifest.ui.dragDrop,
        settings: {
          maximizeApplicationsOnDragEnter: { default: true, scope: "client", type: Boolean },
          minimizeApplicationsOnDragStart: { default: true, scope: "client", type: Boolean },
        },
      },
      general: {
        icon: icons.manifest.ui.settings,
        settings: {
          openConditionsAsJournalEntryPages: { default: true, scope: "user", type: Boolean },
          styleDice: { default: true, scope: "client", type: Boolean },
          unlockSheetsByDefault: { default: false, scope: "user", type: Boolean },
        },
      },
      tooltip: {
        icon: icons.manifest.ui.tooltip,
        settings: {
          compendiumTooltips: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ compendiums: true, tooltips: true }),
          },
          contentLinkTooltips: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ applications: true, tooltips: true }),
          },
          documentTooltips: {
            default: Object.values(documents).filter((d) =>
              foundry.utils.isSubclass(d, foundry.abstract.Document) && d.documentMetadata?.tooltip
            ).map(d => d.documentName),
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
            onChange: () => game.teriock.render({ applications: true, tooltips: true }),
          },
          sidebarTooltips: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ sidebar: true, tooltips: true }),
          },
        },
      },
    },
    icon: icons.manifest.settings.display,
  },
  documentBehavior: {
    format: "tabs",
    groups: Object.fromEntries(
      Object.entries(documentBehaviorConfig.categories).map((
        [category, { icon, settings }],
      ) => [category, {
        icon,
        settings: {
          [category]: { default: settings, requiresReload: true, scope: "user", type: userSettingsModels[category] },
        },
      }]),
    ),
    icon: icons.manifest.ui.document,
  },
  gameMasterControls: {
    format: "tabs",
    groups: {
      general: {
        icon: icons.manifest.ui.settings,
        settings: {
          deathBagStoneColors: {
            default: Object.keys(dieConfig.stones).filter(k => dieConfig.stones[k].initial),
            scope: "world",
            type: new fields.SetField(new fields.StringField({ choices: objectMap(dieConfig.stones, (c) => c.label) })),
          },
          playerMacrosFolderName: { default: "Player Macros", scope: "world", type: String },
          preserveTargetRegions: {
            default: true,
            scope: "world",
            type: Boolean,
            onChange: () => game.teriock.render({ sidebar: true }),
          },
          sortNewPlayerMacros: { default: true, scope: "world", type: Boolean },
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
      },
      permissions: {
        icon: icons.manifest.ui.permissions,
        settings: {
          openChatDocuments: { default: false, scope: "world", type: Boolean },
          openChatImages: { default: true, scope: "world", type: Boolean },
        },
      },
      secrets: {
        icon: icons.manifest.ui.secret,
        settings: {
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
      },
      system: {
        icon: icons.manifest.ui.system,
        settings: {
          nonHierarchicalChanges: { default: true, requiresReload: true, scope: "world", type: Boolean },
          trackSustainedConsequences: { default: true, scope: "world", type: Boolean },
        },
      },

      developer: {
        icon: icons.manifest.ui.developer,
        settings: {
          developerMode: { default: false, scope: "world", type: Boolean },
          dontDropUuidsInTables: { default: false, scope: "world", type: Boolean },
        },
      },
    },
    icon: icons.manifest.settings.gameMasterControls,
  },
  tips: {
    format: "tabs",
    groups: {
      error: {
        icon: icons.manifest.ui.error,
        settings: {
          errorMessages: {
            default: Object.keys(tipConfig.error),
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: tipConfig.error }), {
              initial: Object.keys(tipConfig.error),
            }),
            onChange: () => game.teriock.render({ applications: true, tooltips: true }),
          },
          showErrorTipsOnSheets: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ applications: true }),
          },
          showErrorTipsOnTooltips: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ tooltips: true }),
          },
        },
      },
      suppression: {
        icon: icons.manifest.ui.suppression,
        settings: {
          showSuppressionTipsOnSheets: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ applications: true }),
          },
          showSuppressionTipsOnTooltips: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ tooltips: true }),
          },
          suppressionMessages: {
            default: Object.keys(tipConfig.suppression),
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: tipConfig.suppression }), {
              initial: Object.keys(tipConfig.suppression),
            }),
            onChange: () => game.teriock.render({ applications: true }),
          },
          suppressionMessageTypes: {
            default: Object.entries(documentConfig).filter(([_k, v]) =>
              ["ActiveEffect", "Item"].includes(v.documentName)
            ).map(([k, _v]) => k),
            scope: "client",
            stacked: true,
            type: new fields.SetField(
              new fields.StringField({
                choices: objectMap(documentConfig, (v) => v.label, {
                  filter: v => ["ActiveEffect", "Item"].includes(v.documentName),
                }),
              }),
              {
                initial: Object.entries(documentConfig).filter(([_k, v]) =>
                  ["ActiveEffect", "Item"].includes(v.documentName)
                ).map(([k, _v]) => k),
              },
            ),
            onChange: () => game.teriock.render({ applications: true }),
          },
        },
      },
    },
    icon: icons.manifest.settings.tips,
  },
};

/**
 * Localize a menu entry.
 * @param {string} menuKey
 * @param {Teriock.Settings.MenuEntry} menuEntry
 */
function localizeSettingMenuEntry(menuKey, menuEntry) {
  const path = `TERIOCK.MENUS.${menuKey.capitalize()}`;
  menuEntry.hint ??= `${path}.hint`;
  menuEntry.label ??= `${path}.label`;
  menuEntry.title ??= `${path}.name`;
  const settingEntries = [];
  for (const [groupKey, groupEntry] of Object.entries(menuEntry.groups)) {
    groupEntry.label ??= `${path}.parts.${groupKey}`;
    for (const [settingKey, settingEntry] of Object.entries(groupEntry.settings)) {
      settingEntry.name ??= `TERIOCK.SETTINGS.${settingKey}.name`;
      settingEntry.hint ??= `TERIOCK.SETTINGS.${settingKey}.hint`;
      settingEntries.push(settingEntry);
    }
  }
  menuEntry.restricted ??= settingEntries.every(d => d.scope === "world");
}

/**
 * Register all settings and setting menus.
 */
export function registerSettings() {
  for (const [menuKey, menuEntry] of Object.entries(menus)) {
    localizeSettingMenuEntry(menuKey, menuEntry);
    const menuApplication = MenuFactory(menuKey, menuEntry);
    for (const groupEntry of Object.values(menuEntry.groups)) {
      for (const [settingKey, settingEntry] of Object.entries(groupEntry.settings)) {
        game.settings.register("teriock", settingKey, settingEntry);
      }
    }
    menuApplication.registerMenu();
  }
}
