import { default as templates } from "../index/templates.json" with { type: "json" };
import * as applications from "./applications/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import * as constants from "./constants/_module.mjs";
import * as data from "./data/_module.mjs";
import * as dice from "./dice/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as helpers from "./helpers/_module.mjs";
import * as setup from "./setup/_module.mjs";

const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;

// Register Global References
// ==========================

Object.assign(globalThis, {
  TERIOCK: constants,
  teriock: {
    applications,
    canvas,
    data,
    dice,
    documents,
    fromIdentifier: helpers.utils.fromIdentifier,
    fromIdentifierSync: helpers.utils.fromIdentifierSync,
    helpers,
  },
  tm: { ...helpers, dialogs: applications.dialogs },
});

foundry.helpers.Hooks.once("init", function() {
  /**
   * Helper function to assign configs to `CONFIG` one level deep.
   * @param {object} configs
   */
  function assign(configs) {
    for (const [key, config] of Object.entries(configs)) { Object.assign(CONFIG[key], config); }
  }

  // Register Game Shortcuts
  // =======================

  game.teriock = new helpers.TeriockManager();

  // Configure Time Constants
  // ========================

  CONFIG.time.roundTime = 5;

  // Configure Status Effects
  // ========================

  Object.assign(CONFIG.specialStatusEffects, {
    DEAD: "dead",
    DEFEATED: "down",
    ETHEREAL: "ethereal",
    HIDDEN: "hidden",
  });
  if (game.modules.get("tokenmagic")?.active) {
    Object.assign(
      CONFIG.specialStatusEffects,
      Object.fromEntries(
        Object.keys(constants.display.tokenMagic).map(
          v => [helpers.string.toKebabCase(v).toUpperCase().replaceAll("-", "_"), v]
        ),
      ),
    );
  }
  for (const k of Object.keys(CONFIG.statusEffects)) { delete CONFIG.statusEffects[k]; }
  Object.assign(CONFIG.statusEffects, { ...TERIOCK.data.conditions, ...TERIOCK.data.cover, ...TERIOCK.data.hacks });

  // Configure UI Components
  // =======================

  assign({
    ui: {
      actors: applications.sidebar.TeriockActorDirectory,
      chat: applications.sidebar.TeriockChatLog,
      combat: applications.sidebar.TeriockCombatTracker,
      compendium: applications.sidebar.TeriockCompendiumDirectory,
      hotbar: applications.ui.TeriockHotbar,
      items: applications.sidebar.TeriockItemDirectory,
      notifications: applications.ui.TeriockNotifications,
    },
    ux: {
      ContextMenu: applications.ux.TeriockContextMenu,
      DragDrop: applications.ux.TeriockDragDrop,
      TextEditor: applications.ux.TeriockTextEditor,
      TooltipManager: helpers.interaction.TeriockTooltipManager,
    },
  });
  applications.ux.enrichment.registerEnrichers();
  applications.elements.registerElements();

  // Configure Canvas
  // ================

  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    const id = CONFIG.Canvas.detectionModes[key]?.id;
    if (!["basicSight", "lightPerception"].includes(id)) { delete CONFIG.Canvas.detectionModes[key]; }
  }
  Object.assign(CONFIG.Canvas, {
    detectionModes: { ...CONFIG.Canvas.detectionModes, ...canvas.perception.detectionModes },
    visionModes: { ...CONFIG.Canvas.visionModes, ...canvas.perception.visionModes },
  });

  // Configure Documents
  // ===================

  // Assign Document and Collection Classes
  // --------------------------------------

  assign({
    ActiveEffect: {
      changeTypes: setup.changeConfigs,
      compendiumIndexFields: ["system._sup"],
      dataModels: {
        ability: data.systems.effects.AbilitySystem,
        attunement: data.systems.effects.AttunementSystem,
        base: data.systems.effects.BaseEffectSystem,
        condition: data.systems.effects.ConditionSystem,
        consequence: data.systems.effects.ConsequenceSystem,
        cover: data.systems.effects.BaseEffectSystem,
        fluency: data.systems.effects.FluencySystem,
        hack: data.systems.effects.HackSystem,
        imbuement: data.systems.effects.ImbuementSystem,
        property: data.systems.effects.PropertySystem,
        resource: data.systems.effects.ResourceSystem,
      },
      defaultType: "consequence",
      documentClass: documents.TeriockActiveEffect,
      phases: constants.config.change.phase,
    },
    Actor: {
      collection: documents.collections.TeriockActors,
      dataModels: {
        character: data.systems.actors.CharacterSystem,
        creature: data.systems.actors.CreatureSystem,
        inventory: data.systems.actors.InventorySystem,
      },
      defaultType: "character",
      documentClass: documents.TeriockActor,
    },
    Card: {
      dataModels: { card: data.systems.cards.BaseCardsSystem, stone: data.systems.cards.StoneSystem },
      documentClass: documents.TeriockCard,
    },
    ChatMessage: {
      collection: documents.collections.TeriockChatMessages,
      dataModels: { base: data.systems.messages.BaseMessageSystem },
      documentClass: documents.TeriockChatMessage,
      template: "teriock/ui/chat-message",
    },
    Combat: {
      documentClass: documents.TeriockCombat,
      initiative: { decimals: 2, formula: TERIOCK.config.character.defaults.initiative },
    },
    Combatant: { documentClass: documents.TeriockCombatant },
    Folder: { collection: documents.collections.TeriockFolders, documentClass: documents.TeriockFolder },
    Item: {
      collection: documents.collections.TeriockItems,
      compendiumIndexFields: ["system._sup"],
      dataModels: {
        archetype: data.systems.items.ArchetypeSystem,
        body: data.systems.items.BodySystem,
        equipment: data.systems.items.EquipmentSystem,
        mount: data.systems.items.MountSystem,
        power: data.systems.items.PowerSystem,
        rank: data.systems.items.RankSystem,
        species: data.systems.items.SpeciesSystem,
      },
      defaultType: "power",
      documentClass: documents.TeriockItem,
    },
    JournalEntry: { collection: documents.collections.TeriockJournal, documentClass: documents.TeriockJournalEntry },
    JournalEntryCategory: { documentClass: documents.TeriockJournalEntryCategory },
    JournalEntryPage: {
      dataModels: {
        class: data.systems.pages.ClassSystem,
        damage: data.systems.pages.HarmSystem,
        drain: data.systems.pages.HarmSystem,
        rule: data.systems.pages.RuleSystem,
        tradecraft: data.systems.pages.TradecraftSystem,
      },
      documentClass: documents.TeriockJournalEntryPage,
    },
    Macro: {
      collection: documents.collections.TeriockMacros,
      defaultType: "script",
      documentClass: documents.TeriockMacro,
    },
    Region: { documentClass: documents.TeriockRegionDocument },
    RollTable: { collection: documents.collections.TeriockRollTables, documentClass: documents.TeriockRollTable },
    Scene: { collection: documents.collections.TeriockScenes, documentClass: documents.TeriockScene },
    TableResult: { documentClass: documents.TeriockTableResult },
    Token: {
      documentClass: documents.TeriockTokenDocument,
      hudClass: applications.hud.TeriockTokenHUD,
      objectClass: canvas.placeables.TeriockToken,
    },
    User: { collection: documents.collections.TeriockUsers, documentClass: documents.TeriockUser },
  });

  // Configure Type Icons and Hints
  // ------------------------------

  for (const [k, v] of Object.entries(constants.config.document)) {
    if (v?.documentName) {
      CONFIG[v.documentName].typeIcons[k] = helpers.utils.makeIconClass(v.icon, "title");
      CONFIG[v.documentName].typeHints[k] = v.hint;
    }
  }

  // Configure Sheets
  // ----------------

  // Unregister V1 Sheets
  DocumentSheetConfig.unregisterSheet(documents.TeriockActor, "teriock", ActorSheet);
  DocumentSheetConfig.unregisterSheet(documents.TeriockItem, "teriock", ItemSheet);

  // Register Custom V2 Sheets
  const sheetMap = [
    // Actors
    {
      cls: applications.sheets.actor.CharacterSheet,
      doc: documents.TeriockActor,
      label: "TYPES.Actor.character",
      types: ["character"],
    },
    {
      cls: applications.sheets.actor.CreatureSheet,
      doc: documents.TeriockActor,
      label: "TYPES.Actor.creature",
      types: ["creature"],
    },
    {
      cls: applications.sheets.actor.InventorySheet,
      doc: documents.TeriockActor,
      label: "TYPES.Actor.inventory",
      types: ["inventory"],
    },
    {
      cls: applications.sheets.actor.PlayableActorSheet,
      doc: documents.TeriockActor,
      label: "TYPES.Actor.actor",
      makeDefault: false,
      types: ["inventory"],
    },
    // Items
    {
      cls: applications.sheets.item.ArchetypeSheet,
      doc: documents.TeriockItem,
      label: "TYPES.Item.Archetype",
      types: ["archetype"],
    },
    { cls: applications.sheets.item.BodySheet, doc: documents.TeriockItem, label: "TYPES.Item.body", types: ["body"] },
    {
      cls: applications.sheets.item.EquipmentSheet,
      doc: documents.TeriockItem,
      label: "TYPES.Item.equipment",
      types: ["equipment"],
    },
    {
      cls: applications.sheets.item.MountSheet,
      doc: documents.TeriockItem,
      label: "TYPES.Item.mount",
      types: ["mount"],
    },
    { cls: applications.sheets.item.RankSheet, doc: documents.TeriockItem, label: "TYPES.Item.rank", types: ["rank"] },
    {
      cls: applications.sheets.item.PowerSheet,
      doc: documents.TeriockItem,
      label: "TYPES.Item.power",
      types: ["power"],
    },
    {
      cls: applications.sheets.item.SpeciesSheet,
      doc: documents.TeriockItem,
      label: "TYPES.Item.species",
      types: ["species"],
    },
    // Effects
    {
      cls: applications.sheets.effect.AbilitySheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.ability",
      types: ["ability"],
    },
    {
      cls: applications.sheets.effect.FluencySheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.fluency",
      types: ["fluency"],
    },
    {
      cls: applications.sheets.effect.ResourceSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.resource",
      types: ["resource"],
    },
    {
      cls: applications.sheets.effect.PropertySheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.property",
      types: ["property"],
    },
    {
      cls: applications.sheets.effect.ConsequenceSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.consequence",
      types: ["consequence"],
    },
    {
      cls: applications.sheets.effect.ConditionSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.condition",
      types: ["condition"],
    },
    {
      cls: applications.sheets.effect.AttunementSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.attunement",
      types: ["attunement"],
    },
    {
      cls: applications.sheets.effect.ImbuementSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.imbuement",
      types: ["imbuement"],
    },
    {
      cls: applications.sheets.effect.HackSheet,
      doc: documents.TeriockActiveEffect,
      label: "TYPES.ActiveEffect.hack",
      types: ["hack"],
    },
    // Tokens
    {
      cls: applications.sheets.token.BaseTokenSheet,
      doc: documents.TeriockTokenDocument,
      label: "TYPES.TokenDocument.token",
      types: [],
    },
    // Cards
    {
      cls: foundry.applications.sheets.CardConfig,
      doc: documents.TeriockCard,
      label: "TYPES.Card.card",
      types: ["card", "stone"],
    },
    // Journal Entries
    {
      cls: applications.sheets.journal.BaseJournalSheet,
      doc: documents.TeriockJournalEntry,
      label: "TYPES.JournalEntry.journal",
      types: [],
    },
    // Pages
    {
      cls: applications.sheets.page.DamageSheet,
      doc: documents.TeriockJournalEntryPage,
      label: "TYPES.JournalEntryPage.damage",
      types: ["damage"],
    },
    {
      cls: applications.sheets.page.DrainSheet,
      doc: documents.TeriockJournalEntryPage,
      label: "TYPES.JournalEntryPage.drain",
      types: ["drain", "tradecraft"],
    },
    {
      cls: applications.sheets.page.TradecraftSheet,
      doc: documents.TeriockJournalEntryPage,
      label: "TYPES.JournalEntryPage.tradecraft",
      types: ["tradecraft"],
    },
    {
      cls: applications.sheets.page.ClassSheet,
      doc: documents.TeriockJournalEntryPage,
      label: "TYPES.JournalEntryPage.class",
      types: ["class"],
    },
    {
      cls: applications.sheets.page.RuleSheet,
      doc: documents.TeriockJournalEntryPage,
      label: "TYPES.JournalEntryPage.rule",
      types: ["rule"],
    },
  ];
  sheetMap.forEach(({ cls, doc, label, makeDefault = true, types }) =>
    DocumentSheetConfig.registerSheet(doc, "teriock", cls, { label, makeDefault, types })
  );

  // Configure Dice
  // ==============

  CONFIG.Dice.rolls.length = 0;
  CONFIG.Dice.rolls.push(...[
    dice.rolls.BaseRoll,
    dice.rolls.ThresholdRoll,
    dice.rolls.ImpactRoll,
    dice.rolls.HarmRoll,
  ]);
  CONFIG.Dice.termTypes.FunctionTerm = dice.FunctionTerm;
  for (const category of Object.values(dice.functions)) {
    for (const [k, v] of Object.entries(category)) { CONFIG.Dice.functions[k] = v; }
  }

  // Configure Formula Editor
  // ========================

  Object.entries(constants.rollContext).forEach(([k, v]) => {
    CONFIG.formulaEditor.contexts[k] = { labels: v };
  });

  // Configure Queries
  // =================

  Object.assign(CONFIG.queries, helpers.queries);

  // Register Settings
  // =================

  setup.systemSettings.registerSettings();

  // Register Handlebars Templates
  // =============================

  foundry.applications.handlebars.loadTemplates(templates);
});

// Override Compendium Applications
// ================================

foundry.helpers.Hooks.once("setup", function() {
  for (const pack of game.packs) { pack.applicationClass = applications.sidebar.TeriockCompendium; }
});

// Perform one-time pre-localization and sorting of some configuration objects
// ===========================================================================

Hooks.once("i18nInit", () => {
  helpers.localization.performPreLocalization(TERIOCK);
  Object.assign(CONFIG.formulaEditor.contexts.child.labels, {
    ...TERIOCK.rollContext.ability,
    ...TERIOCK.rollContext.archetype,
    ...TERIOCK.rollContext.armament,
    ...TERIOCK.rollContext.attunement,
    ...TERIOCK.rollContext.condition,
    ...TERIOCK.rollContext.consequence,
    ...TERIOCK.rollContext.fluency,
    ...TERIOCK.rollContext.imbuement,
    ...TERIOCK.rollContext.mount,
    ...TERIOCK.rollContext.power,
    ...TERIOCK.rollContext.property,
    ...TERIOCK.rollContext.rank,
    ...TERIOCK.rollContext.resource,
    ...TERIOCK.rollContext.species,
  });
});

// Final Steps
// ===========

Hooks.once("ready", () => {
  // Initialize Registries
  // ---------------------
  game.teriock.initializeRegistries();
});

// Register Hook Listeners and Handlebars Helpers
// ==============================================

setup.registerHookListeners();
setup.registerHandlebarsHelpers();
