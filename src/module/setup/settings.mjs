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
 * One group per inheritable document behavior settings category.
 * @type {Record<Teriock.Behavior.SettingsCategory, Teriock.Settings.GroupEntry>}
 */
const DOCUMENT_BEHAVIOR_GROUPS = Object.fromEntries(
  Object.entries(documentBehaviorConfig.categories).map((
    [category, { icon, settings }],
  ) => [category, {
    icon,
    settings: { [category]: { default: settings, scope: "user", type: userSettingsModels[category] } },
  }]),
);

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
          floatingActorTabs: { default: true, requiresReload: true, scope: "client", type: Boolean },
          highlightModifiedValues: { default: false, requiresReload: true, scope: "client", type: Boolean },
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
      },
    },
    icon: icons.manifest.settings.display,
  },
  documentBehavior: { format: "tabs", groups: DOCUMENT_BEHAVIOR_GROUPS, icon: icons.manifest.ui.document },
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
            requiresReload: true,
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: tipConfig.error }), {
              initial: Object.keys(tipConfig.error),
            }),
          },
          showErrorTipsOnSheets: { default: true, requiresReload: true, scope: "client", type: Boolean },
          showErrorTipsOnTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
        },
      },
      suppression: {
        icon: icons.manifest.ui.suppression,
        settings: {
          showSuppressionTipsOnSheets: { default: true, requiresReload: true, scope: "client", type: Boolean },
          showSuppressionTipsOnTooltips: { default: true, requiresReload: true, scope: "client", type: Boolean },
          suppressionMessages: {
            default: Object.keys(tipConfig.suppression),
            requiresReload: true,
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: tipConfig.suppression }), {
              initial: Object.keys(tipConfig.suppression),
            }),
          },
          suppressionMessageTypes: {
            default: Object.entries(documentConfig).filter(([_k, v]) =>
              ["ActiveEffect", "Item"].includes(v.documentName)
            ).map(([k, _v]) => k),
            requiresReload: true,
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
          },
        },
      },
    },
    icon: icons.manifest.settings.tips,
  },
};

/**
 * Register all settings and setting menus.
 */
export function registerSettings() {
  for (const [key, menu] of Object.entries(menus)) {
    const application = MenuFactory(key, menu);
    for (const group of Object.values(menu.groups)) {
      for (const [settingKey, definition] of Object.entries(group.settings)) {
        game.settings.register("teriock", settingKey, definition);
      }
    }
    application.registerMenu();
  }
}
