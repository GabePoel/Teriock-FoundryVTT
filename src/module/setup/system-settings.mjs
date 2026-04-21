import * as configs from "../applications/settings/_module.mjs";

const { fields } = foundry.data;

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
    hideBasicAbilitiesByDefault: {
      default: false,
      hint: "TERIOCK.SETTINGS.hideBasicAbilitiesByDefault.hint",
      name: "TERIOCK.SETTINGS.hideBasicAbilitiesByDefault.name",
      scope: "user",
      type: Boolean,
    },
    hideInactiveDocumentsByDefault: {
      default: false,
      hint: "TERIOCK.SETTINGS.hideInactiveDocumentsByDefault.hint",
      name: "TERIOCK.SETTINGS.hideInactiveDocumentsByDefault.name",
      scope: "user",
      type: Boolean,
    },
  },
  armament: {
    rollAttackOnArmamentUse: {
      default: false,
      hint: "TERIOCK.SETTINGS.rollAttackOnArmamentUse.hint",
      name: "TERIOCK.SETTINGS.rollAttackOnArmamentUse.name",
      scope: "user",
      type: Boolean,
    },
    secretEquipment: {
      default: false,
      hint: "TERIOCK.SETTINGS.secretEquipment.hint",
      name: "TERIOCK.SETTINGS.secretEquipment.name",
      scope: "user",
      type: Boolean,
    },
    twoHandedArmaments: {
      default: false,
      hint: "TERIOCK.SETTINGS.twoHandedArmaments.hint",
      name: "TERIOCK.SETTINGS.twoHandedArmaments.name",
      scope: "user",
      type: Boolean,
    },
  },
  armor: {
    armorSuppressesRanks: {
      default: false,
      hint: "TERIOCK.SETTINGS.armorSuppressesRanks.hint",
      scope: "world",
      name: "TERIOCK.SETTINGS.armorSuppressesRanks.name",
      type: Boolean,
    },
    armorWeakensRanks: {
      default: false,
      hint: "TERIOCK.SETTINGS.armorWeakensRanks.hint",
      scope: "world",
      name: "TERIOCK.SETTINGS.armorWeakensRanks.name",
      type: Boolean,
    },
  },
  automatedBehavior: {
    autoChangeVisionModes: {
      default: true,
      hint: "TERIOCK.SETTINGS.autoChangeVisionModes.hint",
      name: "TERIOCK.SETTINGS.autoChangeVisionModes.name",
      scope: "user",
      type: Boolean,
    },
    autoPayAbilityCosts: {
      default: true,
      hint: "TERIOCK.SETTINGS.autoPayAbilityCosts.hint",
      name: "TERIOCK.SETTINGS.autoPayAbilityCosts.name",
      scope: "user",
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
      default: CONFIG.MeasuredTemplate.defaults.angle,
      hint: "TERIOCK.SETTINGS.defaultConeAngle.hint",
      name: "TERIOCK.SETTINGS.defaultConeAngle.name",
      scope: "world",
      type: new fields.NumberField({
        min: 0,
        max: 360,
      }),
    },
    defaultDragonBreathAngle: {
      default: CONFIG.MeasuredTemplate.defaults.angle,
      hint: "TERIOCK.SETTINGS.defaultDragonBreathAngle.hint",
      name: "TERIOCK.SETTINGS.defaultDragonBreathAngle.name",
      scope: "world",
      type: new fields.NumberField({
        min: 0,
        max: 360,
      }),
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
    placeTemplateOnAbilityUse: {
      default: true,
      hint: "TERIOCK.SETTINGS.placeTemplateOnAbilityUse.hint",
      name: "TERIOCK.SETTINGS.placeTemplateOnAbilityUse.name",
      scope: "user",
      type: Boolean,
    },
    showLongRestDialog: {
      default: true,
      hint: "TERIOCK.SETTINGS.showRollDialogs.hint",
      name: "TERIOCK.SETTINGS.showLongRestDialog.name",
      scope: "user",
      type: Boolean,
    },
    showRollDialogs: {
      default: true,
      hint: "TERIOCK.SETTINGS.showRollDialogs.hint",
      name: "TERIOCK.SETTINGS.showRollDialogs.name",
      scope: "client",
      type: Boolean,
    },
  },
  gameContent: {
    documentDamageSources: {
      default: ["Compendium.teriock.rules.JournalEntry.damage0000000000"],
      hint: "TERIOCK.SETTINGS.documentDamageSources.hint",
      name: "TERIOCK.SETTINGS.documentDamageSources.name",
      scope: "world",
      type: new fields.SetField(
        new fields.DocumentUUIDField({ type: "JournalEntry" }),
      ),
    },
    documentDrainSources: {
      default: ["Compendium.teriock.rules.JournalEntry.drain00000000000"],
      hint: "TERIOCK.SETTINGS.documentDrainSources.hint",
      name: "TERIOCK.SETTINGS.documentDrainSources.name",
      scope: "world",
      type: new fields.SetField(
        new fields.DocumentUUIDField({ type: "JournalEntry" }),
      ),
    },
  },
  gameMasterControls: {
    gmDocumentNotesJournalName: {
      default: "GM Document Notes",
      hint: "TERIOCK.SETTINGS.gmDocumentNotesJournalName.hint",
      name: "TERIOCK.SETTINGS.gmDocumentNotesJournalName.name",
      scope: "world",
      type: String,
    },
    openChatDocuments: {
      default: true,
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
    developerMode: {
      default: false,
      hint: "TERIOCK.SETTINGS.developerMode.hint",
      name: "TERIOCK.SETTINGS.developerMode.name",
      scope: "world",
      type: Boolean,
    },
  },
  generalDisplay: {
    autoTokenMagicConditionEffects: {
      default: true,
      hint: "TERIOCK.SETTINGS.autoTokenMagicConditionEffects.hint",
      name: "TERIOCK.SETTINGS.autoTokenMagicConditionEffects.name",
      scope: "world",
      type: Boolean,
    },
    styleDice: {
      default: true,
      hint: "TERIOCK.SETTINGS.styleDice.hint",
      name: "TERIOCK.SETTINGS.styleDice.name",
      scope: "user",
      type: Boolean,
    },
    systemLinks: {
      default: true,
      hint: "TERIOCK.SETTINGS.systemLinks.hint",
      name: "TERIOCK.SETTINGS.systemLinks.name",
      scope: "user",
      type: Boolean,
    },
  },
  panel: {
    autoPanelCollapseTime: {
      default: 5,
      hint: "TERIOCK.SETTINGS.autoPanelCollapseTime.hint",
      name: "TERIOCK.SETTINGS.autoPanelCollapseTime.name",
      scope: "user",
      type: Number,
    },
    defaultPanelCollapseState: {
      default: "auto",
      hint: "TERIOCK.SETTINGS.defaultPanelCollapseState.hint",
      name: "TERIOCK.SETTINGS.defaultPanelCollapseState.name",
      scope: "user",
      type: String,
      choices: {
        auto: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.auto",
        closed: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.closed",
        open: "TERIOCK.SETTINGS.defaultPanelCollapseState.choices.open",
      },
    },
  },
  tooltip: {
    systemTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.systemTooltips.hint",
      name: "TERIOCK.SETTINGS.systemTooltips.name",
      scope: "user",
      type: Boolean,
    },
    compendiumTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.compendiumTooltips.hint",
      name: "TERIOCK.SETTINGS.compendiumTooltips.name",
      scope: "user",
      type: Boolean,
    },
    sidebarTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.sidebarTooltips.hint",
      name: "TERIOCK.SETTINGS.sidebarTooltips.name",
      scope: "user",
      type: Boolean,
    },
    contentLinkTooltips: {
      default: true,
      hint: "TERIOCK.SETTINGS.contentLinkTooltips.hint",
      name: "TERIOCK.SETTINGS.contentLinkTooltips.name",
      scope: "user",
      type: Boolean,
    },
  },
};

/**
 * Register all settings and setting menus.
 */
export function registerSettings() {
  configs.AutomatedBehaviorConfig.registerMenu();
  configs.AlternateRulesConfig.registerMenu();
  configs.DialogConfig.registerMenu();
  configs.DisplayConfig.registerMenu();
  configs.GameContentConfig.registerMenu();
  configs.GameMasterControlsConfig.registerMenu();
  for (const s of Object.values(settings)) {
    for (const [k, d] of Object.entries(s)) {
      game.settings.register("teriock", k, d);
    }
  }
}
