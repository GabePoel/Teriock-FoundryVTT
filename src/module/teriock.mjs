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

/** Global Teriock config */
globalThis.TERIOCK = constants;
/** Global Teriock system module. */
globalThis.teriock = {
  applications: applications,
  canvas: canvas,
  data: data,
  dice: dice,
  documents: documents,
  helpers: helpers,
};
/** Useful helpers brought to the top level for easy access by macros. */
globalThis.tm = {
  create: {
    ability: helpers.createEffects.createAbility,
    consequence: helpers.createEffects.createConsequence,
    fluency: helpers.createEffects.createFluency,
    property: helpers.createEffects.createProperty,
    resource: helpers.createEffects.createResource,
  },
  dialogs: applications.dialogs,
  fetch: helpers.fetch,
  html: helpers.html,
  path: helpers.path,
  string: helpers.string,
  utils: helpers.utils,
};

foundry.helpers.Hooks.once("init", function () {
  CONFIG.TERIOCK = constants;

  CONFIG.ui.hotbar = applications.ui.TeriockHotbar;

  applications.ux.registerEnrichers();

  CONFIG.Combat.initiative = {
    decimals: 2,
    formula: "1d20 + @mov",
  };

  CONFIG.statusEffects.length = 0;
  for (const condition of Object.values(TERIOCK.data.conditions)) {
    CONFIG.statusEffects.push(condition);
  }
  for (const hack of Object.values(TERIOCK.data.hacks)) {
    CONFIG.statusEffects.push(hack);
  }
  for (const transformation of Object.values(TERIOCK.data.transformations)) {
    CONFIG.statusEffects.push(transformation);
  }
  CONFIG.statusEffects.sort((a, b) => {
    if (a.id === "dead") {
      return -1;
    }
    if (b.id === "dead") {
      return 1;
    }
    if (a.id === "unconscious") {
      return b.id === "dead" ? 1 : -1;
    }
    if (b.id === "unconscious") {
      return a.id === "dead" ? -1 : 1;
    }
    if (a.id === "down") {
      if (b.id === "dead" || b.id === "unconscious") {
        return 1;
      }
      return -1;
    }
    if (b.id === "down") {
      if (a.id === "dead" || a.id === "unconscious") {
        return -1;
      }
      return 1;
    }
    return a.id.localeCompare(b.id);
  });
  CONFIG.specialStatusEffects["DEFEATED"] = "down";
  CONFIG.specialStatusEffects["ETHEREAL"] = "ethereal";
  CONFIG.specialStatusEffects["ILLUSION_TRANSFORMED"] = "illusionTransformed";
  CONFIG.specialStatusEffects["TRANSFORMED"] = "transformed";

  // noinspection JSValidateTypes
  CONFIG.Canvas.visionModes = {
    ...CONFIG.Canvas.visionModes,
    ...canvas.perception.visionModes,
  };
  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    const id = CONFIG.Canvas.detectionModes[key].id;
    if (!["basicSight", "lightPerception"].includes(id)) {
      delete CONFIG.Canvas.detectionModes[key];
    }
  }
  // noinspection JSValidateTypes
  CONFIG.Canvas.detectionModes = {
    ...CONFIG.Canvas.detectionModes,
    ...canvas.perception.detectionModes,
  };

  // Register custom core placeables
  CONFIG.Token.objectClass = canvas.placeables.TeriockToken;
  CONFIG.MeasuredTemplate.objectClass =
    canvas.placeables.TeriockMeasuredTemplate;

  // Register custom core documents
  CONFIG.ActiveEffect.documentClass = documents.TeriockEffect;
  CONFIG.Actor.documentClass = documents.TeriockActor;
  CONFIG.ChatMessage.documentClass = documents.TeriockChatMessage;
  CONFIG.Combat.documentClass = documents.TeriockCombat;
  CONFIG.Item.documentClass = documents.TeriockItem;
  CONFIG.JournalEntry.documentClass = documents.TeriockJournalEntry;
  CONFIG.Macro.documentClass = documents.TeriockMacro;
  CONFIG.Scene.documentClass = documents.TeriockScene;
  CONFIG.Token.documentClass = documents.TeriockTokenDocument;
  CONFIG.User.documentClass = documents.TeriockUser;

  // Data models
  Object.assign(CONFIG.Actor.dataModels, {
    character: data.actor.TeriockCharacterModel,
    creature: data.actor.TeriockCreatureModel,
  });
  Object.assign(CONFIG.Item.dataModels, {
    body: data.item.TeriockBodyModel,
    equipment: data.item.TeriockEquipmentModel,
    mechanic: data.item.TeriockMechanicModel,
    power: data.item.TeriockPowerModel,
    rank: data.item.TeriockRankModel,
    species: data.item.TeriockSpeciesModel,
    wrapper: data.item.TeriockWrapperModel,
  });
  Object.assign(CONFIG.ActiveEffect.dataModels, {
    ability: data.effect.TeriockAbilityModel,
    attunement: data.effect.TeriockAttunementModel,
    base: data.effect.TeriockBaseEffectModel,
    condition: data.effect.TeriockConditionModel,
    consequence: data.effect.TeriockConsequenceModel,
    fluency: data.effect.TeriockFluencyModel,
    property: data.effect.TeriockPropertyModel,
    resource: data.effect.TeriockResourceModel,
  });
  Object.assign(CONFIG.ChatMessage.dataModels, {
    base: data.message.TeriockBaseMessageModel,
  });

  // UX
  CONFIG.ux.TooltipManager = helpers.interaction.TeriockTooltipManager;

  // Unregister V1 sheets
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

  // Register custom sheets
  const sheetMap = [
    // Actors
    {
      cls: applications.sheets.actor.CharacterSheet,
      doc: documents.TeriockActor,
      label: "Character",
      types: ["character"],
    },
    {
      cls: applications.sheets.actor.CreatureSheet,
      doc: documents.TeriockActor,
      label: "Creature",
      types: ["creature"],
    },
    // Items
    {
      cls: applications.sheets.item.BodySheet,
      doc: documents.TeriockItem,
      label: "Body Part",
      types: ["body"],
    },
    {
      cls: applications.sheets.item.EquipmentSheet,
      doc: documents.TeriockItem,
      label: "Equipment",
      types: ["equipment"],
    },
    {
      cls: applications.sheets.item.RankSheet,
      doc: documents.TeriockItem,
      label: "Rank",
      types: ["rank"],
    },
    {
      cls: applications.sheets.item.PowerSheet,
      doc: documents.TeriockItem,
      label: "Power",
      types: ["power"],
    },
    {
      cls: applications.sheets.item.MechanicSheet,
      doc: documents.TeriockItem,
      label: "Mechanic",
      types: ["mechanic"],
    },
    {
      cls: applications.sheets.item.SpeciesSheet,
      doc: documents.TeriockItem,
      label: "Species",
      types: ["species"],
    },
    {
      cls: applications.sheets.item.WrapperSheet,
      doc: documents.TeriockItem,
      label: "Wrapper",
      types: ["wrapper"],
    },
    // Effects
    {
      cls: applications.sheets.effect.AbilitySheet,
      doc: documents.TeriockEffect,
      label: "Ability",
      types: ["ability"],
    },
    {
      cls: applications.sheets.effect.FluencySheet,
      doc: documents.TeriockEffect,
      label: "Fluency",
      types: ["fluency"],
    },
    {
      cls: applications.sheets.effect.ResourceSheet,
      doc: documents.TeriockEffect,
      label: "Resource",
      types: ["resource"],
    },
    {
      cls: applications.sheets.effect.PropertySheet,
      doc: documents.TeriockEffect,
      label: "Property",
      types: ["property"],
    },
    {
      cls: applications.sheets.effect.ConsequenceSheet,
      doc: documents.TeriockEffect,
      label: "Consequence",
      makeDefault: false,
      types: ["consequence"],
    },
  ];
  sheetMap.forEach(({ cls, label, types, doc, makeDefault = true }) =>
    DocumentSheetConfig.registerSheet(doc, "teriock", cls, {
      label,
      makeDefault,
      types,
    }),
  );

  // Registering custom dice rolls and functions
  CONFIG.Dice.rolls.length = 0;
  CONFIG.Dice.rolls.push(dice.TeriockRoll);

  // Modifying index fields
  CONFIG.ActiveEffect.IndexFields = [
    "system.hierarchy.rootUuid",
    "system.hierarchy.subIds",
    "system.hierarchy.supId",
  ];

  // Registering custom queries
  Object.assign(CONFIG.queries, {
    "teriock.addToSustaining": helpers.queries.addToSustainingQuery,
    "teriock.callPseudoHook": helpers.queries.callPseudoHookQuery,
    "teriock.createHotbarFolder": helpers.queries.createHotbarFolderQuery,
    "teriock.inCombatExpiration": helpers.queries.inCombatExpirationQuery,
    "teriock.resetAttackPenalties": helpers.queries.resetAttackPenalties,
    "teriock.sustainedExpiration": helpers.queries.sustainedExpirationQuery,
    "teriock.timeAdvance": helpers.queries.timeAdvanceQuery,
    "teriock.update": helpers.queries.updateQuery,
    "teriock.updateEmbeddedDocuments":
      helpers.queries.updateEmbeddedDocumentsQuery,
  });

  const packs =
    /** @type {Collection<string,CompendiumCollection>} */ game.packs;

  // noinspection JSUndefinedPropertyAssignment
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
    Roll: dice.TeriockRoll,
    data: data,
    packs: {
      abilities: () =>
        /** @type {TeriockWrapperCompendium} */
        packs.get("teriock.abilities"),
      bodyParts: () =>
        /** @type {TeriockBodyCompendium} */
        packs.get("teriock.bodyParts"),
      classes: () =>
        /** @type {TeriockRankCompendium} */
        packs.get("teriock.classes"),
      creatures: () =>
        /** @type {TeriockCharacterCompendium} */
        packs.get("teriock.creatures"),
      equipment: () =>
        /** @type {TeriockEquipmentCompendium} */
        packs.get("teriock.equipment"),
      essentials: () =>
        /** @type {TeriockPowerCompendium} */
        packs.get("teriock.essentials"),
      execution: () =>
        /** @type {TeriockMacroCompendium} */
        packs.get("teriock.execution"),
      maintenance: () =>
        /** @type {TeriockMacroCompendium} */
        packs.get("teriock.maintenance"),
      powers: () =>
        /** @type {TeriockPowerCompendium} */
        packs.get("teriock.powers"),
      properties: () =>
        /** @type {TeriockWrapperCompendium} */
        packs.get("teriock.properties"),
      rules: () =>
        /** @type {TeriockJournalCompendium} */
        packs.get("teriock.rules"),
      species: () =>
        /** @type {TeriockSpeciesCompendium} */
        packs.get("teriock.species"),
    },
  };

  // Register settings
  setup.systemSettings.registerSettings();

  // Register custom handlebars templates
  helpers.maintenance.registerTemplates();
});

for (const hook of Object.values(setup.hookManagement)) {
  if (typeof hook === "function") {
    hook();
  }
}

for (const helper of Object.values(setup.handlebarHelpers)) {
  if (typeof helper === "function") {
    helper();
  }
}
