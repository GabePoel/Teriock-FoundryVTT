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
    applications: applications,
    canvas: canvas,
    data: data,
    dice: dice,
    documents: documents,
    helpers: helpers,
  },
  tm: {
    dialogs: applications.dialogs,
    fetch: helpers.fetch,
    html: helpers.html,
    path: helpers.path,
    resolve: helpers.resolve,
    sort: helpers.sort,
    string: helpers.string,
    unit: helpers.unit,
    utils: helpers.utils,
    rolling: helpers.rolling,
  },
});

foundry.helpers.Hooks.once("init", function () {
  /**
   * Helper function to assign configs to `CONFIG` on level deep.
   * @param {object} configs
   */
  function assign(configs) {
    for (const [key, config] of Object.entries(configs)) {
      Object.assign(CONFIG[key], config);
    }
  }

  // Configure Time Constants
  // ========================

  CONFIG.time.roundTime = 5;

  // Configure Status Effects
  // ========================

  Object.assign(CONFIG.specialStatusEffects, {
    BURNED: "burned",
    CHARMED: "charmed",
    DEFEATED: "down",
    ETHEREAL: "ethereal",
    FRENZIED: "frenzied",
    FROZEN: "frozen",
    HIDDEN: "hidden",
    HOLLIED: "hollied",
    ILLUSION_TRANSFORMED: "illusionTransformed",
    LIGHTED: "lighted",
    MELEE_DODGING: "meleeDodging",
    MISSILE_DODGING: "missileDodging",
    POISONED: "poisoned",
    RUINED: "ruined",
    SNARED: "snared",
    TERRORED: "terrored",
    TRANSFORMED: "transformed",
    ...Object.fromEntries(
      Object.values(TERIOCK.data.hacks).map((h) => [h.id.toUpperCase(), h.id]),
    ),
  });
  CONFIG.statusEffects.length = 0;
  CONFIG.statusEffects.push(
    ...Object.values(TERIOCK.data.conditions),
    ...Object.values(TERIOCK.data.hacks),
    ...Object.values(TERIOCK.data.transformations),
  );
  CONFIG.statusEffects.sort((a, b) => {
    return a.id.localeCompare(b.id);
  });

  // Configure UI Components
  // =======================

  assign({
    ui: {
      actors: applications.sidebar.TeriockActorDirectory,
      hotbar: applications.ui.TeriockHotbar,
      notifications: applications.ui.TeriockNotifications,
      items: applications.sidebar.TeriockItemDirectory,
      combat: applications.sidebar.TeriockCombatTracker,
    },
    ux: {
      TooltipManager: helpers.interaction.TeriockTooltipManager,
      TextEditor: applications.ux.TeriockTextEditor,
      DragDrop: applications.ux.TeriockDragDrop,
      ContextMenu: applications.ux.TeriockContextMenu,
    },
  });
  applications.ux.registerEnrichers();

  // Configure Canvas
  // ================

  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    const id = CONFIG.Canvas.detectionModes[key].id;
    if (!["basicSight", "lightPerception"].includes(id)) {
      delete CONFIG.Canvas.detectionModes[key];
    }
  }
  Object.assign(CONFIG.Canvas, {
    detectionModes: {
      ...CONFIG.Canvas.detectionModes,
      ...canvas.perception.detectionModes,
    },
    visionModes: {
      ...CONFIG.Canvas.visionModes,
      ...canvas.perception.visionModes,
    },
  });

  // Configure Documents
  // ===================

  // Assign Document and Collection Classes
  // --------------------------------------

  assign({
    ActiveEffect: {
      dataModels: {
        ability: data.effect.TeriockAbilityModel,
        attunement: data.effect.TeriockAttunementModel,
        base: data.effect.TeriockBaseEffectModel,
        condition: data.effect.TeriockConditionModel,
        consequence: data.effect.TeriockConsequenceModel,
        fluency: data.effect.TeriockFluencyModel,
        property: data.effect.TeriockPropertyModel,
        resource: data.effect.TeriockResourceModel,
      },
      documentClass: documents.TeriockEffect,
    },
    Actor: {
      collections: documents.collections.TeriockActors,
      dataModels: {
        character: data.actor.TeriockCharacterModel,
        creature: data.actor.TeriockCreatureModel,
      },
      documentClass: documents.TeriockActor,
    },
    ChatMessage: {
      collection: documents.collections.TeriockChatMessages,
      dataModels: {
        base: data.message.TeriockBaseMessageModel,
      },
      documentClass: documents.TeriockChatMessage,
      template: helpers.path.systemPath(
        "templates/ui-templates/chat-message.hbs",
      ),
    },
    Combat: {
      initiative: {
        decimals: 2,
        formula: TERIOCK.options.character.initiative,
      },
      documentClass: documents.TeriockCombat,
    },
    Combatant: {
      documentClass: documents.TeriockCombatant,
    },
    Folder: {
      collection: documents.collections.TeriockFolders,
      documentClass: documents.TeriockFolder,
    },
    Item: {
      collection: documents.collections.TeriockItems,
      compendiumIndexFields: ["system._sup"],
      dataModels: {
        body: data.item.TeriockBodyModel,
        equipment: data.item.TeriockEquipmentModel,
        mount: data.item.TeriockMountModel,
        power: data.item.TeriockPowerModel,
        rank: data.item.TeriockRankModel,
        species: data.item.TeriockSpeciesModel,
        wrapper: data.item.TeriockWrapperModel,
      },
      documentClass: documents.TeriockItem,
    },
    JournalEntry: {
      documentClass: documents.TeriockJournalEntry,
      collection: documents.collections.TeriockJournal,
    },
    JournalEntryCategory: {
      documentClass: documents.TeriockJournalEntryCategory,
    },
    JournalEntryPage: {
      documentClass: documents.TeriockJournalEntryPage,
    },
    Macro: {
      documentClass: documents.TeriockMacro,
      collection: documents.collections.TeriockMacros,
    },
    RollTable: {
      documentClass: documents.TeriockRollTable,
      collection: documents.collections.TeriockRollTables,
    },
    Scene: {
      documentClass: documents.TeriockScene,
      collection: documents.collections.TeriockScenes,
    },
    TableResult: {
      documentClass: documents.TeriockTableResult,
    },
    Token: {
      documentClass: documents.TeriockTokenDocument,
      hudClass: applications.hud.TeriockTokenHUD,
      objectClass: canvas.placeables.TeriockToken,
    },
    User: {
      documentClass: documents.TeriockUser,
      collection: documents.collections.TeriockUsers,
    },
  });

  // Configure Type Icons
  // --------------------

  for (const [k, v] of Object.entries(constants.options.document)) {
    if (v.doc) {
      CONFIG[v.doc].typeIcons[k] = helpers.utils.makeIconClass(v.icon, "title");
    }
  }

  // Configure Sheets
  // ----------------

  // Unregister V1 Sheets
  DocumentSheetConfig.unregisterSheet(
    documents.TeriockActor,
    "teriock",
    ActorSheet,
  );
  DocumentSheetConfig.unregisterSheet(
    documents.TeriockItem,
    "teriock",
    ItemSheet,
  );

  // Register Custom V2 Sheets
  const sheetMap = [
    // Actors
    {
      cls: applications.sheets.actor.TeriockCharacterSheet,
      doc: documents.TeriockActor,
      label: "Character",
      types: ["character"],
    },
    {
      cls: applications.sheets.actor.TeriockCreatureSheet,
      doc: documents.TeriockActor,
      label: "Creature",
      types: ["creature"],
    },
    {
      cls: applications.sheets.actor.TeriockInventorySheet,
      doc: documents.TeriockActor,
      label: "Inventory",
      types: ["character", "creature"],
      makeDefault: false,
    },
    // Items
    {
      cls: applications.sheets.item.TeriockBodySheet,
      doc: documents.TeriockItem,
      label: "Body Part",
      types: ["body"],
    },
    {
      cls: applications.sheets.item.TeriockEquipmentSheet,
      doc: documents.TeriockItem,
      label: "Equipment",
      types: ["equipment"],
    },
    {
      cls: applications.sheets.item.TeriockMountSheet,
      doc: documents.TeriockItem,
      label: "Mount",
      types: ["mount"],
    },
    {
      cls: applications.sheets.item.TeriockRankSheet,
      doc: documents.TeriockItem,
      label: "Rank",
      types: ["rank"],
    },
    {
      cls: applications.sheets.item.TeriockPowerSheet,
      doc: documents.TeriockItem,
      label: "Power",
      types: ["power"],
    },
    {
      cls: applications.sheets.item.TeriockSpeciesSheet,
      doc: documents.TeriockItem,
      label: "Species",
      types: ["species"],
    },
    {
      cls: applications.sheets.item.TeriockWrapperSheet,
      doc: documents.TeriockItem,
      label: "Wrapper",
      types: ["wrapper"],
    },
    // Effects
    {
      cls: applications.sheets.effect.TeriockAbilitySheet,
      doc: documents.TeriockEffect,
      label: "Ability",
      types: ["ability"],
    },
    {
      cls: applications.sheets.effect.TeriockFluencySheet,
      doc: documents.TeriockEffect,
      label: "Fluency",
      types: ["fluency"],
    },
    {
      cls: applications.sheets.effect.TeriockResourceSheet,
      doc: documents.TeriockEffect,
      label: "Resource",
      types: ["resource"],
    },
    {
      cls: applications.sheets.effect.TeriockPropertySheet,
      doc: documents.TeriockEffect,
      label: "Property",
      types: ["property"],
    },
    {
      cls: applications.sheets.effect.TeriockConsequenceSheet,
      doc: documents.TeriockEffect,
      label: "Consequence",
      types: ["consequence"],
    },
    // Tokens
    {
      cls: applications.sheets.token.TeriockBaseTokenSheet,
      doc: documents.TeriockTokenDocument,
      label: "Token",
      types: [],
    },
  ];
  sheetMap.forEach(({ cls, label, types, doc, makeDefault = true }) =>
    DocumentSheetConfig.registerSheet(doc, "teriock", cls, {
      label,
      makeDefault,
      types,
    }),
  );

  // Configure Dice
  // ==============

  CONFIG.Dice.rolls.length = 0;
  CONFIG.Dice.rolls.push(dice.TeriockRoll);
  CONFIG.Dice.termTypes.FunctionTerm = dice.FunctionTerm;
  for (const category of Object.values(dice.functions)) {
    for (const [k, v] of Object.entries(category)) {
      CONFIG.Dice.functions[k] = v;
    }
  }

  // Configure Queries
  // =================

  Object.assign(CONFIG.queries, helpers.queries);

  // Register Game Shortcuts
  // =======================

  game.teriock = {
    Actor: documents.TeriockActor,
    Combat: documents.TeriockCombat,
    Effect: documents.TeriockEffect,
    Item: documents.TeriockItem,
    Macro: documents.TeriockMacro,
    ChatMessage: documents.TeriockChatMessage,
    Scene: documents.TeriockScene,
    Token: documents.TeriockTokenDocument,
    User: documents.TeriockUser,
    JournalEntry: documents.TeriockJournalEntry,
    JournalEntryPage: documents.TeriockJournalEntryPage,
    JournalEntryCategory: documents.TeriockJournalEntryCategory,
    Roll: dice.TeriockRoll,
    data: data,
    packs: new documents.collections.TeriockPacks(),
  };

  // Register Settings
  // =================

  setup.systemSettings.registerSettings();

  // Register Handlebars Templates
  // =============================

  helpers.maintenance.registerTemplates();
});

// Override Compendium Applications
// ================================

foundry.helpers.Hooks.once("setup", function () {
  for (const pack of game.packs) {
    pack.applicationClass = applications.sidebar.TeriockCompendium;
  }
});

// Register Hooks
// ==============

for (const hook of Object.values(setup.hookManagement)) {
  if (typeof hook === "function") {
    hook();
  }
}

// Register Handlebars Helpers
// ===========================

for (const helper of Object.values(setup.handlebarHelpers)) {
  if (typeof helper === "function") {
    helper();
  }
}
