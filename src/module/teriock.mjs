import { default as templates } from "../json/templates.json" with { type: "json" };
import * as applications from "./applications/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import * as constants from "./constants/_module.mjs";
import * as data from "./data/_module.mjs";
import * as dice from "./dice/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as executions from "./executions/_module.mjs";
import * as helpers from "./helpers/_module.mjs";
import { makeIconClass } from "./helpers/icon.mjs";
import * as setup from "./setup/_module.mjs";

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
    executions,
    fromIdentifier: helpers.utils.fromIdentifier,
    fromIdentifierSync: helpers.utils.fromIdentifierSync,
    helpers,
  },
});

foundry.helpers.Hooks.once("init", function() {
  // Register Game Shortcuts
  // =======================

  game.teriock = new helpers.TeriockManager();

  // Configure Time Constants
  // ========================

  CONFIG.time.roundTime = 5;

  // Configure Status Effects
  // ========================

  Object.assign(CONFIG.specialStatusEffects, {
    ANOSMATIC: "anosmatic",
    BLIND: "blind",
    DEAD: "dead",
    DEAF: "deaf",
    DEFEATED: "down",
    ETHEREAL: "ethereal",
    HIDDEN: "hidden",
  });
  for (const k of Object.keys(CONFIG.statusEffects)) { delete CONFIG.statusEffects[k]; }
  Object.assign(CONFIG.statusEffects, {
    ...TERIOCK.statuses.conditions,
    ...TERIOCK.statuses.cover,
    ...TERIOCK.statuses.hacks,
  });

  // Configure UI and UX Components
  // =======================

  CONFIG.ui.actors = applications.sidebar.tabs.TeriockActorDirectory;
  CONFIG.ui.chat = applications.sidebar.tabs.TeriockChatLog;
  CONFIG.ui.combat = applications.sidebar.tabs.TeriockCombatTracker;
  CONFIG.ui.compendium = applications.sidebar.tabs.TeriockCompendiumDirectory;
  CONFIG.ui.hotbar = applications.ui.TeriockHotbar;
  CONFIG.ui.items = applications.sidebar.tabs.TeriockItemDirectory;
  CONFIG.ui.notifications = applications.ui.TeriockNotifications;
  CONFIG.ui.pause = applications.ui.TeriockGamePause;
  CONFIG.ui.tables = applications.sidebar.tabs.TeriockRollTableDirectory;

  CONFIG.ux.ContextMenu = applications.ux.TeriockContextMenu;
  CONFIG.ux.DragDrop = applications.ux.TeriockDragDrop;
  CONFIG.ux.TextEditor = applications.ux.TeriockTextEditor;
  CONFIG.ux.TooltipManager = helpers.interaction.TeriockTooltipManager;

  applications.ux.enrichment.registerEnrichers();

  const fontPath = (s) => `${helpers.path.systemPath(`assets/fonts/${s}`)}`;

  Object.assign(CONFIG.fontDefinitions, {
    "Alegreya SC": {
      editor: true,
      fonts: [
        { style: "normal", urls: [fontPath("alegreya-sc/AlegreyaSC-Regular.ttf")], weight: "400" },
        { style: "normal", urls: [fontPath("alegreya-sc/AlegreyaSC-Medium.ttf")], weight: "500" },
        { style: "normal", urls: [fontPath("alegreya-sc/AlegreyaSC-Bold.ttf")], weight: "700" },
        { style: "normal", urls: [fontPath("alegreya-sc/AlegreyaSC-ExtraBold.ttf")], weight: "800" },
        { style: "normal", urls: [fontPath("alegreya-sc/AlegreyaSC-Black.ttf")], weight: "900" },
        { style: "italic", urls: [fontPath("alegreya-sc/AlegreyaSC-Italic.ttf")], weight: "400" },
        { style: "italic", urls: [fontPath("alegreya-sc/AlegreyaSC-MediumItalic.ttf")], weight: "500" },
        { style: "italic", urls: [fontPath("alegreya-sc/AlegreyaSC-BoldItalic.ttf")], weight: "700" },
        { style: "italic", urls: [fontPath("alegreya-sc/AlegreyaSC-ExtraBoldItalic.ttf")], weight: "800" },
        { style: "italic", urls: [fontPath("alegreya-sc/AlegreyaSC-BlackItalic.ttf")], weight: "900" },
      ],
    },
    Augusta: { editor: true, fonts: [{ urls: [fontPath("augusta/Augusta.ttf")] }] },
    "Augusta Shadow": { editor: false, fonts: [{ urls: [fontPath("augusta-shadow/Augusta-Shadow.ttf")] }] },
    Quintessential: {
      editor: true,
      fonts: [{ style: "normal", urls: [fontPath("quintessential/Quintessential-Regular.ttf")], weight: "400" }],
    },
    XmasTerpiece: { editor: true, fonts: [{ urls: [fontPath("xmas-terpiece/XmasTerpiece.ttf")] }] },
    XmasTerpieceSwashes: {
      editor: true,
      fonts: [{ urls: [fontPath("xmas-terpiece-swashes/XmasTerpieceSwashes.ttf")] }],
    },
  });

  // Configure Canvas
  // ================

  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    const id = CONFIG.Canvas.detectionModes[key]?.id;
    if (!["basicSight", "lightPerception"].includes(id)) { delete CONFIG.Canvas.detectionModes[key]; }
  }
  Object.assign(CONFIG.Canvas, {
    darknessSourceClass: canvas.sources.TeriockPointDarknessSource,
    detectionModes: { ...CONFIG.Canvas.detectionModes, ...canvas.perception.detectionModes },
    lightSourceClass: canvas.sources.TeriockPointLightSource,
    visionModes: { ...CONFIG.Canvas.visionModes, ...canvas.perception.visionModes },
  });
  CONFIG.Canvas.layers.lighting.layerClass = canvas.layers.TeriockLightingLayer;

  // Configure Documents
  // ===================

  // Assign Document and Collection Classes
  // --------------------------------------

  CONFIG.ActiveEffect.changeTypes = constants.config.change.types;
  CONFIG.ActiveEffect.compendiumIndexFields = ["system._sup"];
  CONFIG.ActiveEffect.dataModels.ability = data.systems.effects.AbilitySystem;
  CONFIG.ActiveEffect.dataModels.attunement = data.systems.effects.AttunementSystem;
  CONFIG.ActiveEffect.dataModels.base = data.systems.effects.BaseEffectSystem;
  CONFIG.ActiveEffect.dataModels.condition = data.systems.effects.ConditionSystem;
  CONFIG.ActiveEffect.dataModels.consequence = data.systems.effects.ConsequenceSystem;
  CONFIG.ActiveEffect.dataModels.cover = data.systems.effects.BaseEffectSystem;
  CONFIG.ActiveEffect.dataModels.fluency = data.systems.effects.FluencySystem;
  CONFIG.ActiveEffect.dataModels.hack = data.systems.effects.HackSystem;
  CONFIG.ActiveEffect.dataModels.imbuement = data.systems.effects.ImbuementSystem;
  CONFIG.ActiveEffect.dataModels.property = data.systems.effects.PropertySystem;
  CONFIG.ActiveEffect.dataModels.resource = data.systems.effects.ResourceSystem;
  CONFIG.ActiveEffect.defaultType = "consequence";
  CONFIG.ActiveEffect.documentClass = documents.TeriockActiveEffect;
  CONFIG.ActiveEffect.expiryAction = "delete";
  CONFIG.ActiveEffect.phases = constants.config.change.phase;

  CONFIG.Actor.collection = documents.collections.TeriockActors;
  CONFIG.Actor.dataModels.character = data.systems.actors.CharacterSystem;
  CONFIG.Actor.dataModels.creature = data.systems.actors.CreatureSystem;
  CONFIG.Actor.dataModels.inventory = data.systems.actors.InventorySystem;
  CONFIG.Actor.defaultType = "character";
  CONFIG.Actor.documentClass = documents.TeriockActor;

  CONFIG.AmbientLight.documentClass = documents.TeriockAmbientLightDocument;
  CONFIG.AmbientLight.objectClass = canvas.placeables.TeriockAmbientLight;

  CONFIG.Card.dataModels.card = data.systems.cards.BaseCardsSystem;
  CONFIG.Card.dataModels.stone = data.systems.cards.StoneSystem;
  CONFIG.Card.documentClass = documents.TeriockCard;

  CONFIG.ChatMessage.collection = documents.collections.TeriockChatMessages;
  CONFIG.ChatMessage.dataModels.base = data.systems.messages.BaseMessageSystem;
  CONFIG.ChatMessage.dataModels.interactive = data.systems.messages.InteractiveSystem;
  CONFIG.ChatMessage.dataModels.triggered = data.systems.messages.TriggeredSystem;
  CONFIG.ChatMessage.defaultType = "interactive";
  CONFIG.ChatMessage.documentClass = documents.TeriockChatMessage;
  CONFIG.ChatMessage.popoutClass = applications.sidebar.apps.TeriockChatPopout;
  CONFIG.ChatMessage.template = "teriock/ui/chat-message";

  CONFIG.Combat.documentClass = documents.TeriockCombat;
  CONFIG.Combat.initiative.decimals = 2;
  CONFIG.Combat.initiative.formula = teriock.executions.activity.InitiativeExecution.DEFAULT_FORMULA;

  CONFIG.Combatant.documentClass = documents.TeriockCombatant;

  CONFIG.Folder.collection = documents.collections.TeriockFolders;
  CONFIG.Folder.documentClass = documents.TeriockFolder;

  CONFIG.Item.collection = documents.collections.TeriockItems;
  CONFIG.Item.compendiumIndexFields = ["system._sup"];
  CONFIG.Item.dataModels.archetype = data.systems.items.ArchetypeSystem;
  CONFIG.Item.dataModels.body = data.systems.items.BodySystem;
  CONFIG.Item.dataModels.equipment = data.systems.items.EquipmentSystem;
  CONFIG.Item.dataModels.mount = data.systems.items.MountSystem;
  CONFIG.Item.dataModels.power = data.systems.items.PowerSystem;
  CONFIG.Item.dataModels.rank = data.systems.items.RankSystem;
  CONFIG.Item.dataModels.species = data.systems.items.SpeciesSystem;
  CONFIG.Item.defaultType = "power";
  CONFIG.Item.documentClass = documents.TeriockItem;

  CONFIG.JournalEntry.collection = documents.collections.TeriockJournal;
  CONFIG.JournalEntry.documentClass = documents.TeriockJournalEntry;

  CONFIG.JournalEntryCategory.documentClass = documents.TeriockJournalEntryCategory;

  CONFIG.JournalEntryPage.dataModels.class = data.systems.pages.ClassSystem;
  CONFIG.JournalEntryPage.dataModels.damage = data.systems.pages.HarmSystem;
  CONFIG.JournalEntryPage.dataModels.drain = data.systems.pages.HarmSystem;
  CONFIG.JournalEntryPage.dataModels.rule = data.systems.pages.RuleSystem;
  CONFIG.JournalEntryPage.dataModels.tradecraft = data.systems.pages.TradecraftSystem;
  CONFIG.JournalEntryPage.documentClass = documents.TeriockJournalEntryPage;

  CONFIG.Macro.collection = documents.collections.TeriockMacros;
  CONFIG.Macro.defaultType = "script";
  CONFIG.Macro.documentClass = documents.TeriockMacro;

  CONFIG.Region.documentClass = documents.TeriockRegionDocument;

  CONFIG.RollTable.collection = documents.collections.TeriockRollTables;
  CONFIG.RollTable.documentClass = documents.TeriockRollTable;

  CONFIG.Scene.collection = documents.collections.TeriockScenes;
  CONFIG.Scene.documentClass = documents.TeriockScene;

  CONFIG.TableResult.documentClass = documents.TeriockTableResult;

  CONFIG.Token.documentClass = documents.TeriockTokenDocument;
  CONFIG.Token.hudClass = applications.hud.TeriockTokenHUD;
  CONFIG.Token.objectClass = canvas.placeables.TeriockToken;

  CONFIG.User.collection = documents.collections.TeriockUsers;
  CONFIG.User.documentClass = documents.TeriockUser;

  // Configure Type Icons and Hints
  // ------------------------------

  for (const [k, v] of Object.entries(constants.config.document)) {
    if (v?.documentName) {
      CONFIG[v.documentName].typeIcons[k] = makeIconClass(v.icon, "title");
      CONFIG[v.documentName].typeHints[k] = v.hint;
    }
  }

  // Configure Sheets
  // ----------------

  const rs = (doc, sheet, label, options = {}) => {
    foundry.applications.apps.DocumentSheetConfig.registerSheet(doc, "teriock", sheet, {
      label: `TERIOCK.SHEETS.${label}.LABEL`,
      makeDefault: true,
      ...options,
    });
  };

  const d = documents;
  const s = applications.sheets;
  const se = s.effect;
  const sa = s.actor;
  const si = s.item;
  const su = s.utility;

  rs(d.TeriockActiveEffect, se.AbilitySheet, "Ability", { types: ["ability"] });
  rs(d.TeriockActiveEffect, se.ApplicableEffectSheet, "ApplicableEffect", { types: ["imbuement"] });
  rs(d.TeriockActiveEffect, se.AttunementSheet, "Attunement", { types: ["attunement"] });
  rs(d.TeriockActiveEffect, se.ConditionSheet, "Condition", { types: ["condition"] });
  rs(d.TeriockActiveEffect, se.ConsequenceSheet, "Consequence", { types: ["consequence"] });
  rs(d.TeriockActiveEffect, se.FluencySheet, "Fluency", { types: ["fluency"] });
  rs(d.TeriockActiveEffect, se.HackSheet, "Hack", { types: ["hack"] });
  rs(d.TeriockActiveEffect, se.PropertySheet, "Property", { types: ["property"] });
  rs(d.TeriockActiveEffect, se.ResourceSheet, "Resource", { types: ["resource"] });
  rs(d.TeriockActiveEffect, su.PanelSheet, "Panel", { makeDefault: false, types: d.TeriockActiveEffect.TYPES });

  rs(d.TeriockActor, sa.InventorySheet, "Inventory", { types: ["inventory"] });
  rs(d.TeriockActor, sa.PlayableActorSheet, "Playable", { types: ["character", "creature"] });
  rs(d.TeriockActor, su.PanelSheet, "Panel", { makeDefault: false, types: d.TeriockActor.TYPES });

  rs(d.TeriockAmbientLightDocument, s.TeriockAmbientLightConfig, "AmbientLight");

  rs(d.TeriockItem, si.ArmamentSheet, "Armament", { types: ["body"] });
  rs(d.TeriockItem, si.EquipmentSheet, "Equipment", { types: ["equipment"] });
  rs(d.TeriockItem, si.MountSheet, "Mount", { types: ["mount"] });
  rs(d.TeriockItem, si.PowerSheet, "Power", { types: ["power"] });
  rs(d.TeriockItem, si.RankSheet, "Rank", { types: ["rank"] });
  rs(d.TeriockItem, si.SpeciesSheet, "Species", { types: ["species"] });
  rs(d.TeriockItem, su.ChildSheet, "Child", { types: ["archetype"] });
  rs(d.TeriockItem, su.PanelSheet, "Panel", { makeDefault: false, types: d.TeriockItem.TYPES });

  rs(d.TeriockJournalEntry, s.TeriockJournalEntrySheet, "Journal");

  rs(d.TeriockJournalEntryPage, s.TeriockPageSheet, "Page", {
    types: ["class", "damage", "drain", "rule", "tradecraft"],
  });

  rs(d.TeriockRollTable, s.TeriockRollTableSheet, "RollTable");

  rs(d.TeriockTableResult, s.TeriockTableResultConfig, "TableResult");

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

  game.teriock.templatesReady = foundry.applications.handlebars.loadTemplates(templates);
});

// Override Compendium Applications
// ================================

foundry.helpers.Hooks.once("setup", function() {
  for (const pack of game.packs) { pack.applicationClass = applications.sidebar.apps.TeriockCompendium; }
  game.teriock.initializeDependents();
});

// Perform one-time pre-localization and sorting of some configuration objects
// ===========================================================================

Hooks.once("i18nInit", () => {
  game.teriock.i18nReady = true;
  for (
    const v of Object.values({
      ...teriock.executions.abstract,
      ...teriock.executions.activity,
      ...teriock.executions.actor,
      ...teriock.executions.document,
    })
  ) {
    if (foundry.utils.isSubclass(v, teriock.executions.abstract.BaseExecution)) {
      v.preLocalize();
    }
  }
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
  game.tooltip.initializeLoadingTooltip();
});

// Final Steps
// ===========

Hooks.once("ready", () => {
  game.teriock.initializeIdentifiers();
  applications.ux.TeriockDragDrop.registerGlobalDragHandler();
});

// Register Hook Listeners and Handlebars Helpers
// ==============================================

setup.registerHookListeners();
setup.registerHandlebarsHelpers();
