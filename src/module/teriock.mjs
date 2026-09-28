import { default as templates } from "../json/templates.json" with { type: "json" };
import * as applications from "./applications/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import * as constants from "./constants/_module.mjs";
import * as data from "./data/_module.mjs";
import * as dice from "./dice/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as executions from "./executions/_module.mjs";
import * as helpers from "./helpers/_module.mjs";
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
  // ==============================

  CONFIG.ui.actors = applications.sidebar.tabs.TeriockActorDirectory;
  CONFIG.ui.chat = applications.sidebar.tabs.TeriockChatLog;
  CONFIG.ui.combat = applications.sidebar.tabs.TeriockCombatTracker;
  CONFIG.ui.compendium = applications.sidebar.tabs.TeriockCompendiumDirectory;
  CONFIG.ui.hotbar = applications.ui.TeriockHotbar;
  CONFIG.ui.items = applications.sidebar.tabs.TeriockItemDirectory;
  CONFIG.ui.notifications = applications.ui.TeriockNotifications;
  CONFIG.ui.pause = applications.ui.TeriockGamePause;
  CONFIG.ui.tables = applications.sidebar.tabs.TeriockRollTableDirectory;

  CONFIG.Region.sidebar.applicationClass = applications.sidebar.tabs.TeriockRegionTab;

  CONFIG.ux.ContextMenu = applications.ux.TeriockContextMenu;
  CONFIG.ux.DragDrop = applications.ux.TeriockDragDrop;
  CONFIG.ux.TextEditor = applications.ux.TeriockTextEditor;
  CONFIG.ux.TooltipManager = helpers.interaction.TeriockTooltipManager;

  applications.ux.enrichment.registerEnrichers();
  applications.ux.inserts.registerInserts();

  // Define Fonts
  // ------------

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

  const registerSubtypes = (module) => {
    for (const model of Object.values(module)) {
      if (foundry.utils.isSubclass(model, foundry.abstract.TypeDataModel)) { model.registerModel?.(); }
    }
  };

  CONFIG.ActiveEffect.changeTypes = constants.config.change.types;
  CONFIG.ActiveEffect.compendiumIndexFields = ["system._sup"];
  CONFIG.ActiveEffect.defaultType = "consequence";
  CONFIG.ActiveEffect.documentClass = documents.TeriockActiveEffect;
  CONFIG.ActiveEffect.expiryAction = "delete";
  CONFIG.ActiveEffect.phases = constants.config.change.phase;
  registerSubtypes(data.systems.effects);

  CONFIG.Actor.collection = documents.collections.TeriockActors;
  CONFIG.Actor.defaultType = "character";
  CONFIG.Actor.documentClass = documents.TeriockActor;
  registerSubtypes(data.systems.actors);

  CONFIG.AmbientLight.documentClass = documents.TeriockAmbientLightDocument;
  CONFIG.AmbientLight.objectClass = canvas.placeables.TeriockAmbientLight;

  CONFIG.Card.documentClass = documents.TeriockCard;
  registerSubtypes(data.systems.cards);

  CONFIG.ChatMessage.defaultType = "interactive";
  CONFIG.ChatMessage.documentClass = documents.TeriockChatMessage;
  CONFIG.ChatMessage.popoutClass = applications.sidebar.apps.TeriockChatPopout;
  CONFIG.ChatMessage.template = "teriock/ui/chat-message";
  registerSubtypes(data.systems.messages);

  CONFIG.Combat.documentClass = documents.TeriockCombat;
  CONFIG.Combat.initiative.decimals = 2;
  CONFIG.Combat.initiative.formula = teriock.executions.activity.InitiativeExecution.DEFAULT_FORMULA;

  CONFIG.Combatant.documentClass = documents.TeriockCombatant;

  CONFIG.Folder.documentClass = documents.TeriockFolder;

  CONFIG.Item.compendiumIndexFields = ["system._sup"];
  CONFIG.Item.defaultType = "power";
  CONFIG.Item.documentClass = documents.TeriockItem;
  registerSubtypes(data.systems.items);

  CONFIG.JournalEntry.documentClass = documents.TeriockJournalEntry;

  CONFIG.JournalEntryCategory.documentClass = documents.TeriockJournalEntryCategory;

  CONFIG.JournalEntryPage.documentClass = documents.TeriockJournalEntryPage;
  registerSubtypes(data.systems.pages);

  CONFIG.Macro.defaultType = "script";
  CONFIG.Macro.documentClass = documents.TeriockMacro;

  CONFIG.Region.documentClass = documents.TeriockRegionDocument;

  CONFIG.RollTable.documentClass = documents.TeriockRollTable;

  CONFIG.Scene.documentClass = documents.TeriockScene;

  CONFIG.TableResult.documentClass = documents.TeriockTableResult;

  CONFIG.Token.documentClass = documents.TeriockTokenDocument;
  CONFIG.Token.hudClass = applications.hud.TeriockTokenHUD;
  CONFIG.Token.objectClass = canvas.placeables.TeriockToken;

  CONFIG.User.collection = documents.collections.TeriockUsers;
  CONFIG.User.documentClass = documents.TeriockUser;

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
  const sa = s.actor;
  const se = s.effect;
  const si = s.item;
  const sp = s.page;
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

  rs(d.TeriockJournalEntryPage, sp.BasePageSheet, "Page", {
    types: ["damage", "drain", "rule", "style", "tradecraft"],
  });
  rs(d.TeriockJournalEntryPage, sp.ClassSheet, "Class", { types: ["class"] });

  rs(d.TeriockRollTable, s.TeriockRollTableSheet, "RollTable");

  rs(d.TeriockTableResult, s.TeriockTableResultConfig, "TableResult");

  // Configure Dice
  // ==============

  CONFIG.Dice.rolls.length = 0;
  CONFIG.Dice.rolls.push(...[
    dice.rolls.BaseRoll,
    dice.rolls.ThresholdRoll,
    dice.rolls.ImpactsRoll,
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
});

// Localization and Config Sorting
// ===============================

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
  game.tooltip.initializeLoadingTooltip();
});

// Formula Editor Context
// ======================

Hooks.once("teriock.identifiersInit", () => {
  const rc = TERIOCK.rollContext;
  const effectLabels = {
    ...rc.ability,
    ...rc.attunement,
    ...rc.condition,
    ...rc.consequence,
    ...rc.fluency,
    ...rc.imbuement,
    ...rc.property,
    ...rc.resource,
  };
  const itemLabels = { ...rc.archetype, ...rc.armament, ...rc.mount, ...rc.power, ...rc.rank, ...rc.species };
  const namespaced = (labels, prefix, key) =>
    Object.fromEntries(
      Object.entries(labels).map((
        [k, name],
      ) => [`${prefix}.${k}`, _loc(`TERIOCK.ROLL_CONTEXT.Namespace.${key}`, { name })]),
    );
  // Local qualifiers see a single candidate's local data
  Object.assign(rc.child, effectLabels, itemLabels);
  // Executions see the actor and the documents involved in the execution
  Object.assign(
    rc.execution,
    rc.actor,
    namespaced({ ...effectLabels, ...itemLabels }, "source", "source"),
    namespaced(rc.ability, "ability", "ability"),
    namespaced(rc.armament, "armament", "armament"),
    namespaced(rc.armament, "ammunition", "ammunition"),
  );
  // Document formulas may run in an execution or against the document's own nearest effect and item
  Object.assign(
    rc.document,
    rc.execution,
    namespaced(effectLabels, "this.effect", "thisEffect"),
    namespaced(itemLabels, "this.item", "thisItem"),
  );
  // Mechanic formulas may also run from a fired trigger
  Object.assign(rc.trigger, rc.document);
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
