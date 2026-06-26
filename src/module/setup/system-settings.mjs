import * as configs from "../applications/settings/_module.mjs";
import documentConfig from "../constants/config/document-config.mjs";
import settingsConfig from "../constants/config/settings-config.mjs";
import tipConfig from "../constants/config/tip-config.mjs";
import { userSettingsModels } from "../data/models/settings-models/user-settings-models.mjs";
import { objectMap } from "../helpers/utils.mjs";

const { fields } = foundry.data;

/** @type {Record<Teriock.Config.SettingsCategory, SettingConfig>} */
export const inheritedSettings = Object.fromEntries(
  Object.keys(settingsConfig).map(
    category => [category, {
      default: settingsConfig[category],
      hint: `TERIOCK.SETTINGS.${category}.hint`,
      name: `TERIOCK.SETTINGS.${category}.name`,
      scope: "user",
      type: userSettingsModels[category],
    }]
  ),
);

export const settings = {
  actorSheet: {
    floatingActorTabs: {
      default: true,
      hint: "TERIOCK.SETTINGS.floatingActorTabs.hint",
      name: "TERIOCK.SETTINGS.floatingActorTabs.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
  },
  armor: {
    armorSuppressesRanks: {
      default: false,
      hint: "TERIOCK.SETTINGS.armorSuppressesRanks.hint",
      name: "TERIOCK.SETTINGS.armorSuppressesRanks.name",
      scope: "world",
      type: Boolean,
    },
    armorWeakensRanks: {
      default: false,
      hint: "TERIOCK.SETTINGS.armorWeakensRanks.hint",
      name: "TERIOCK.SETTINGS.armorWeakensRanks.name",
      scope: "world",
      type: Boolean,
    },
  },
  automatedBehavior: {
    autoPayAbilityCosts: {
      default: true,
      hint: "TERIOCK.SETTINGS.autoPayAbilityCosts.hint",
      name: "TERIOCK.SETTINGS.autoPayAbilityCosts.name",
      scope: "user",
      type: Boolean,
    },
    autoWound: {
      default: true,
      hint: "TERIOCK.SETTINGS.autoWound.hint",
      name: "TERIOCK.SETTINGS.autoWound.name",
      scope: "world",
      type: Boolean,
    },
    nonHierarchicalChanges: {
      default: true,
      hint: "TERIOCK.SETTINGS.nonHierarchicalChanges.hint",
      name: "TERIOCK.SETTINGS.nonHierarchicalChanges.name",
      requiresReload: true,
      scope: "world",
      type: Boolean,
    },
    rollImpactsOnUse: {
      default: false,
      hint: "TERIOCK.SETTINGS.rollImpactsOnUse.hint",
      name: "TERIOCK.SETTINGS.rollImpactsOnUse.name",
      requiresReload: true,
      scope: "user",
      type: Boolean,
    },
    trackSustainedConsequences: {
      default: true,
      hint: "TERIOCK.SETTINGS.trackSustainedConsequences.hint",
      name: "TERIOCK.SETTINGS.trackSustainedConsequences.name",
      scope: "world",
      type: Boolean,
    },
  },
  cone: {
    defaultConeAngle: {
      default: 60,
      hint: "TERIOCK.SETTINGS.defaultConeAngle.hint",
      name: "TERIOCK.SETTINGS.defaultConeAngle.name",
      scope: "world",
      type: new fields.NumberField({ max: 360, min: 0 }),
    },
    defaultDragonBreathAngle: {
      default: 60,
      hint: "TERIOCK.SETTINGS.defaultDragonBreathAngle.hint",
      name: "TERIOCK.SETTINGS.defaultDragonBreathAngle.name",
      scope: "world",
      type: new fields.NumberField({ max: 360, min: 0 }),
    },
  },
  dialog: {
    confirmStatDiceRerolls: {
      default: true,
      hint: "TERIOCK.SETTINGS.confirmStatDiceRerolls.hint",
      name: "TERIOCK.SETTINGS.confirmStatDiceRerolls.name",
      scope: "user",
      type: Boolean,
    },
    showRollDialogs: {
      default: true,
      hint: "TERIOCK.SETTINGS.showRollDialogs.hint",
      name: "TERIOCK.SETTINGS.showRollDialogs.name",
      scope: "user",
      type: Boolean,
    },
  },
  error: {
    errorMessages: {
      default: Object.keys(tipConfig.error),
      hint: "TERIOCK.SETTINGS.errorMessages.hint",
      name: "TERIOCK.SETTINGS.errorMessages.name",
      requiresReload: true,
      scope: "client",
      type: new fields.SetField(new fields.StringField({ choices: tipConfig.error }), {
        initial: Object.keys(tipConfig.error),
      }),
    },
    showErrorTipsOnSheets: {
      default: true,
      hint: "TERIOCK.SETTINGS.showErrorTipsOnSheets.hint",
      name: "TERIOCK.SETTINGS.showErrorTipsOnSheets.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
    showErrorTipsOnTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.showErrorTipsOnTooltips.hint",
      name: "TERIOCK.SETTINGS.showErrorTipsOnTooltips.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
  },
  gameContent: {
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
      hint: "TERIOCK.SETTINGS.identifierSourcePriority.hint",
      name: "TERIOCK.SETTINGS.identifierSourcePriority.name",
      requiresReload: true,
      scope: "world",
      type: new fields.TypedObjectField(new fields.NumberField(), { expandKeys: false }),
    },
  },
  gameMasterControls: {
    developerMode: {
      default: false,
      hint: "TERIOCK.SETTINGS.developerMode.hint",
      name: "TERIOCK.SETTINGS.developerMode.name",
      scope: "world",
      type: Boolean,
    },
    gmDocumentNotesJournalName: {
      default: "GM Document Notes",
      hint: "TERIOCK.SETTINGS.gmDocumentNotesJournalName.hint",
      name: "TERIOCK.SETTINGS.gmDocumentNotesJournalName.name",
      scope: "world",
      type: String,
    },
    openChatDocuments: {
      default: false,
      hint: "TERIOCK.SETTINGS.openChatDocuments.hint",
      name: "TERIOCK.SETTINGS.openChatDocuments.name",
      scope: "world",
      type: Boolean,
    },
    openChatImages: {
      default: true,
      hint: "TERIOCK.SETTINGS.openChatImages.hint",
      name: "TERIOCK.SETTINGS.openChatImages.name",
      scope: "world",
      type: Boolean,
    },
    playerMacrosFolderName: {
      default: "Player Macros",
      hint: "TERIOCK.SETTINGS.playerMacrosFolderName.hint",
      name: "TERIOCK.SETTINGS.playerMacrosFolderName.name",
      scope: "world",
      type: String,
    },
    sortNewPlayerMacros: {
      default: true,
      hint: "TERIOCK.SETTINGS.sortNewPlayerMacros.hint",
      name: "TERIOCK.SETTINGS.sortNewPlayerMacros.name",
      scope: "world",
      type: Boolean,
    },
  },
  generalDisplay: {
    styleDice: {
      default: true,
      hint: "TERIOCK.SETTINGS.styleDice.hint",
      name: "TERIOCK.SETTINGS.styleDice.name",
      scope: "client",
      type: Boolean,
    },
  },
  panel: {
    autoPanelCollapseTime: {
      default: 5,
      hint: "TERIOCK.SETTINGS.autoPanelCollapseTime.hint",
      name: "TERIOCK.SETTINGS.autoPanelCollapseTime.name",
      scope: "client",
      type: Number,
    },
    defaultPanelCollapseState: {
      choices: {
        auto: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.auto",
        closed: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.closed",
        open: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.open",
      },
      default: "auto",
      hint: "TERIOCK.SETTINGS.defaultPanelCollapseState.hint",
      name: "TERIOCK.SETTINGS.defaultPanelCollapseState.name",
      scope: "client",
      type: String,
    },
    openPanelContextMenuEntry: {
      default: true,
      hint: "TERIOCK.SETTINGS.openPanelContextMenuEntry.hint",
      name: "TERIOCK.SETTINGS.openPanelContextMenuEntry.name",
      scope: "client",
      type: Boolean,
    },
  },
  suppression: {
    showSuppressionTipsOnSheets: {
      default: true,
      hint: "TERIOCK.SETTINGS.showSuppressionTipsOnSheets.hint",
      name: "TERIOCK.SETTINGS.showSuppressionTipsOnSheets.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
    showSuppressionTipsOnTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.showSuppressionTipsOnTooltips.hint",
      name: "TERIOCK.SETTINGS.showSuppressionTipsOnTooltips.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
    suppressionMessages: {
      default: Object.keys(tipConfig.suppression),
      hint: "TERIOCK.SETTINGS.suppressionMessages.hint",
      name: "TERIOCK.SETTINGS.suppressionMessages.name",
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
      hint: "TERIOCK.SETTINGS.suppressionMessageTypes.hint",
      name: "TERIOCK.SETTINGS.suppressionMessageTypes.name",
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
    compendiumTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.compendiumTooltips.hint",
      name: "TERIOCK.SETTINGS.compendiumTooltips.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
    contentLinkTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.contentLinkTooltips.hint",
      name: "TERIOCK.SETTINGS.contentLinkTooltips.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
    sidebarTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.sidebarTooltips.hint",
      name: "TERIOCK.SETTINGS.sidebarTooltips.name",
      requiresReload: true,
      scope: "client",
      type: Boolean,
    },
  },
};

/**
 * Register all settings and setting menus.
 */
export function registerSettings() {
  configs.AbilitySettingsConfig.registerMenu();
  configs.ActorSettingsConfig.registerMenu();
  configs.ArmamentSettingsConfig.registerMenu();
  configs.AutomatedBehaviorConfig.registerMenu();
  configs.AlternateRulesConfig.registerMenu();
  configs.DialogConfig.registerMenu();
  configs.DisplayConfig.registerMenu();
  configs.TipsConfig.registerMenu();
  configs.GameContentConfig.registerMenu();
  configs.GameMasterControlsConfig.registerMenu();
  for (const [k, d] of Object.entries(inheritedSettings)) { game.settings.register("teriock", k, d); }
  for (const s of Object.values(settings)) {
    for (const [k, d] of Object.entries(s)) { game.settings.register("teriock", k, d); }
  }
}
