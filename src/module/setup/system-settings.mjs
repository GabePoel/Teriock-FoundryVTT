import * as menus from "../applications/menus/_module.mjs";
import attributeConfig from "../constants/config/attribute-config.mjs";
import dieConfig from "../constants/config/death-bag-config.mjs";
import documentConfig from "../constants/config/document-config.mjs";
import settingsConfig from "../constants/config/settings-config.mjs";
import tipConfig from "../constants/config/tip-config.mjs";
import { TypedIdentifierSetField } from "../data/fields/_module.mjs";
import { tradecraftsField } from "../data/fields/tools/builders.mjs";
import { userSettingsModels } from "../data/models/settings-models/_module.mjs";
import * as documents from "../documents/_module.mjs";
import { objectMap } from "../helpers/utils.mjs";

const { fields } = foundry.data;

/** @type {Record<Teriock.Config.SettingsCategory, SettingConfig>} */
export const inheritedSettings = Object.fromEntries(
  Object.keys(settingsConfig.categories).map(
    category => [category, {
      default: settingsConfig.categories[category],
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
    highlightModifiedValues: {
      default: false,
      hint: "TERIOCK.SETTINGS.highlightModifiedValues.hint",
      name: "TERIOCK.SETTINGS.highlightModifiedValues.name",
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
      hint: "TERIOCK.SETTINGS.identifierSourcePriority.hint",
      name: "TERIOCK.SETTINGS.identifierSourcePriority.name",
      requiresReload: true,
      scope: "world",
      type: new fields.TypedObjectField(new fields.NumberField(), { expandKeys: false }),
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
  developer: {
    developerMode: {
      default: false,
      hint: "TERIOCK.SETTINGS.developerMode.hint",
      name: "TERIOCK.SETTINGS.developerMode.name",
      scope: "world",
      type: Boolean,
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
    selectAddedDocuments: {
      default: true,
      hint: "TERIOCK.SETTINGS.selectAddedDocuments.hint",
      name: "TERIOCK.SETTINGS.selectAddedDocuments.name",
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
  gameMasterControls: {
    deathBagStoneColors: {
      default: Object.keys(dieConfig.stones).filter(k => dieConfig.stones[k].initial),
      hint: "TERIOCK.SETTINGS.deathBagStoneColors.hint",
      name: "TERIOCK.SETTINGS.deathBagStoneColors.name",
      scope: "world",
      type: new fields.SetField(new fields.StringField({ choices: objectMap(dieConfig.stones, (c) => c.label) })),
    },
    nonHierarchicalChanges: {
      default: true,
      hint: "TERIOCK.SETTINGS.nonHierarchicalChanges.hint",
      name: "TERIOCK.SETTINGS.nonHierarchicalChanges.name",
      requiresReload: true,
      scope: "world",
      type: Boolean,
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
    trackSustainedConsequences: {
      default: true,
      hint: "TERIOCK.SETTINGS.trackSustainedConsequences.hint",
      name: "TERIOCK.SETTINGS.trackSustainedConsequences.name",
      scope: "world",
      type: Boolean,
    },
  },
  generalDisplay: {
    openConditionsAsJournalEntryPages: {
      default: true,
      hint: "TERIOCK.SETTINGS.openConditionsAsJournalEntryPages.hint",
      name: "TERIOCK.SETTINGS.openConditionsAsJournalEntryPages.name",
      scope: "client",
      type: Boolean,
    },
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
  secrets: {
    deathBagMessageMode: {
      default: null,
      hint: "TERIOCK.SETTINGS.deathBagMessageMode.hint",
      name: "TERIOCK.SETTINGS.deathBagMessageMode.name",
      scope: "world",
      type: new fields.StringField({
        choices: objectMap(CONFIG.ChatMessage.modes, (c) => c.label),
        initial: null,
        nullable: true,
      }),
    },
    secretAttributes: {
      default: [],
      hint: "TERIOCK.SETTINGS.secretAttributes.hint",
      name: "TERIOCK.SETTINGS.secretAttributes.name",
      scope: "world",
      type: new fields.SetField(new fields.StringField({ choices: objectMap(attributeConfig, (c) => c.label) })),
    },
    secretDocuments: {
      default: [],
      hint: "TERIOCK.SETTINGS.secretDocuments.hint",
      name: "TERIOCK.SETTINGS.secretDocuments.name",
      scope: "world",
      type: new TypedIdentifierSetField(),
    },
    secretTradecrafts: {
      default: [],
      hint: "TERIOCK.SETTINGS.secretTradecrafts.hint",
      name: "TERIOCK.SETTINGS.secretTradecrafts.name",
      scope: "world",
      type: tradecraftsField(),
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
    documentTooltips: {
      default: Object.values(documents).filter((d) =>
        foundry.utils.isSubclass(d, foundry.abstract.Document) && d.documentMetadata?.tooltip
      ).map(d => d.documentName),
      hint: "TERIOCK.SETTINGS.documentTooltips.hint",
      name: "TERIOCK.SETTINGS.documentTooltips.name",
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
