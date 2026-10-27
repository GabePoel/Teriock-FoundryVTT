import { CompendiumPriorityMenu, MenuFactory } from "../applications/menus/_module.mjs";
import { PlayableActorSheet } from "../applications/sheets/actor-sheets/_module.mjs";
import { InfiniteNumberField, TypedIdentifierSetField } from "../data/fields/_module.mjs";
import { tradecraftsField } from "../data/fields/tools/builders.mjs";
import { userSettingsModels } from "../data/models/settings-models/_module.mjs";
import * as documents from "../documents/_module.mjs";
import { objectMap } from "../utils/_module.mjs";

const { fields } = foundry.data;

/**
 * Every system setting.
 * @type {Record<string, Teriock.Settings.MenuEntry>}
 */
export const menus = {
  alternateRules: {
    groups: {
      armor: {
        icon: TERIOCK.DISPLAY.icons.manifest.target.armor,
        settings: {
          armorSuppressesRanks: { default: false, scope: "world", type: Boolean },
          armorWeakensRanks: { default: false, scope: "world", type: Boolean },
        },
      },
      cone: {
        icon: TERIOCK.DISPLAY.icons.manifest.delivery.cone,
        settings: {
          defaultConeAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
          defaultDragonBreathAngle: { default: 60, scope: "world", type: new fields.NumberField({ max: 360, min: 0 }) },
        },
      },
      keyword: {
        icon: TERIOCK.DISPLAY.icons.manifest.document.keyword,
        settings: {
          numericalBoostsAndDeboosts: { default: false, scope: "world", type: Boolean },
          randomBoostedTypes: { default: false, scope: "world", type: Boolean },
        },
      },
    },
    icon: TERIOCK.DISPLAY.icons.manifest.settings.alternateRules,
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
    icon: TERIOCK.DISPLAY.icons.manifest.ui.compendium,
  },
  dialog: {
    groups: {
      general: {
        settings: {
          confirmStatDiceRerolls: { default: true, scope: "user", type: Boolean },
          showRollDialogs: { default: true, scope: "user", type: Boolean },
        },
      },
    },
    icon: TERIOCK.DISPLAY.icons.manifest.settings.dialog,
  },
  display: {
    format: "tabs",
    groups: {
      chat: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.chat,
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
          deleteTriggerOnActivation: { default: false, scope: "client", type: Boolean },
          openPanelContextMenuEntry: { default: true, scope: "client", type: Boolean },
          styleDice: { default: true, scope: "client", type: Boolean },
        },
      },
      dragDrop: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.dragDrop,
        settings: {
          maximizeApplicationsOnDragEnter: { default: true, scope: "client", type: Boolean },
          minimizeApplicationsOnDragStart: { default: true, scope: "client", type: Boolean },
        },
      },
      sheets: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.sheet,
        settings: {
          defaultActorTab: {
            default: "tradecrafts",
            scope: "client",
            type: new fields.StringField({
              blank: false,
              initial: "tradecrafts",
              nullable: false,
              required: true,
              choices: () => Object.fromEntries(PlayableActorSheet.SECTIONS.map(({ id, label }) => [id, label])),
            }),
          },
          floatingActorTabs: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ actors: true }),
          },
          highlightEditableValues: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: value => document.body.classList.toggle("teriock-no-editable-highlights", !value),
          },
          highlightModifiedValues: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ applications: true }),
          },
          openConditionsAsJournalEntryPages: { default: true, scope: "user", type: Boolean },
          showInfoIcons: {
            default: true,
            scope: "client",
            type: Boolean,
            onChange: () => game.teriock.render({ applications: true }),
          },
          unlockSheetsByDefault: { default: false, scope: "user", type: Boolean },
        },
      },
      tooltip: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.tooltip,
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
    icon: TERIOCK.DISPLAY.icons.manifest.settings.display,
  },
  /** @category Behavior */
  documentBehavior: {
    format: "tabs",
    groups: Object.fromEntries(
      Object.entries(TERIOCK.CONFIG.documentBehavior.categories).map((
        [category, { icon, settings }],
      ) => [category, {
        icon,
        settings: {
          [category]: { default: settings, requiresReload: true, scope: "user", type: userSettingsModels[category] },
        },
      }]),
    ),
    icon: TERIOCK.DISPLAY.icons.manifest.ui.document,
  },
  gameMasterControls: {
    format: "tabs",
    groups: {
      general: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.settings,
        settings: {
          deathBagStoneColors: {
            default: Object.keys(TERIOCK.CONFIG.deathBag.stones).filter(k => TERIOCK.CONFIG.deathBag.stones[k].initial),
            scope: "world",
            type: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.deathBag.stones })),
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
            type: new fields.StringField({ choices: CONFIG.ChatMessage.modes, initial: "self", nullable: false }),
          },
        },
      },
      permissions: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.permissions,
        settings: {
          openChatDocuments: { default: false, scope: "world", type: Boolean },
          openChatImages: { default: true, scope: "world", type: Boolean },
        },
      },
      secrets: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.secret,
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
            type: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.attribute })),
          },
          secretDocuments: { default: [], scope: "world", type: new TypedIdentifierSetField() },
          secretTradecrafts: { default: [], scope: "world", type: tradecraftsField() },
          showPrivateTradecraftDiceRolls: { default: true, scope: "world", type: Boolean },
        },
      },
      system: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.system,
        settings: {
          nonHierarchicalChanges: { default: true, requiresReload: true, scope: "world", type: Boolean },
          trackSustainedConsequences: { default: true, scope: "world", type: Boolean },
        },
      },

      developer: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.developer,
        settings: {
          developerMode: { default: false, scope: "world", type: Boolean },
          dontDropUuidsInTables: { default: false, scope: "world", type: Boolean },
        },
      },
    },
    icon: TERIOCK.DISPLAY.icons.manifest.settings.gameMasterControls,
  },
  tips: {
    format: "tabs",
    groups: {
      error: {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.error,
        settings: {
          errorMessages: {
            default: Object.keys(TERIOCK.CONFIG.tip.error),
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.tip.error }), {
              initial: Object.keys(TERIOCK.CONFIG.tip.error),
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
        icon: TERIOCK.DISPLAY.icons.manifest.ui.suppression,
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
            default: Object.keys(TERIOCK.CONFIG.tip.suppression),
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.tip.suppression }), {
              initial: Object.keys(TERIOCK.CONFIG.tip.suppression),
            }),
            onChange: () => game.teriock.render({ applications: true }),
          },
          suppressionMessageTypes: {
            scope: "client",
            stacked: true,
            type: new fields.SetField(new fields.StringField({ choices: childTypeChoices }), {
              initial: () => Object.keys(childTypeChoices()),
            }),
            onChange: () => game.teriock.render({ applications: true }),
          },
        },
      },
    },
    icon: TERIOCK.DISPLAY.icons.manifest.settings.tips,
  },
};

/**
 * Labels for effect and item types.
 * @returns {Record<string, string>}
 */
function childTypeChoices() {
  return Object.fromEntries(
    ["ActiveEffect", "Item"].flatMap(d => Object.keys(CONFIG[d].dataModels).map(k => [k, CONFIG[d].typeLabels[k]])),
  );
}

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
