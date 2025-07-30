const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;
import * as applications from "./applications/_module.mjs";
import * as createEffects from "./helpers/create-effects.mjs";
import * as data from "./data/_module.mjs";
import * as dialogs from "./applications/dialogs/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as handlebars from "./helpers/handlebars/_module.mjs";
import * as hooks from "./helpers/hooks/_module.mjs";
import * as queries from "./helpers/queries/_module.mjs";
import * as utils from "./helpers/utils.mjs";
import * as wiki from "./helpers/wiki.mjs";
import TERIOCK from "./helpers/config.mjs";
import registerTemplates from "./helpers/register-templates.mjs";
import { conditions } from "./content/conditions.mjs";
import { teriockDetectionModes } from "./canvas/perception/detection-modes.mjs";
import { teriockVisionModes } from "./canvas/perception/vision-modes.mjs";

foundry.helpers.Hooks.once("init", function () {
  CONFIG.TERIOCK = TERIOCK;

  CONFIG.ui.hotbar = applications.ui.TeriockHotbar;

  CONFIG.Combat.initiative = {
    formula: "1d20 + @mov",
    decimals: 2,
  };

  CONFIG.statusEffects.length = 0;
  for (const condition of Object.values(conditions)) {
    CONFIG.statusEffects.push(condition);
  }
  CONFIG.statusEffects.sort((a, b) => {
    if (a.id === "dead") return -1;
    if (b.id === "dead") return 1;
    if (a.id === "unconscious") return b.id === "dead" ? 1 : -1;
    if (b.id === "unconscious") return a.id === "dead" ? -1 : 1;
    if (a.id === "down") {
      if (b.id === "dead" || b.id === "unconscious") return 1;
      return -1;
    }
    if (b.id === "down") {
      if (a.id === "dead" || a.id === "unconscious") return -1;
      return 1;
    }
    return a.id.localeCompare(b.id);
  });
  CONFIG.specialStatusEffects["ETHEREAL"] = "ethereal";

  CONFIG.Canvas.visionModes = {
    ...CONFIG.Canvas.visionModes,
    ...teriockVisionModes,
  };
  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    if (CONFIG.Canvas.detectionModes[key]?.id !== "basicSight") {
      delete CONFIG.Canvas.detectionModes[key];
    }
  }
  CONFIG.Canvas.detectionModes = {
    ...CONFIG.Canvas.detectionModes,
    ...teriockDetectionModes,
  };

  // Register custom core documents
  CONFIG.ActiveEffect.documentClass = documents.TeriockEffect;
  CONFIG.Actor.documentClass = documents.TeriockActor;
  CONFIG.ChatMessage.documentClass = documents.TeriockMessage;
  CONFIG.Combat.documentClass = documents.TeriockCombat;
  CONFIG.Item.documentClass = documents.TeriockItem;
  CONFIG.Macro.documentClass = documents.TeriockMacro;
  CONFIG.Scene.documentClass = documents.TeriockScene;
  CONFIG.Token.documentClass = documents.TeriockToken;
  CONFIG.User.documentClass = documents.TeriockUser;

  // Data models
  Object.assign(CONFIG.Actor.dataModels, {
    character: data.actor.CharacterData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    equipment: data.item.EquipmentData,
    power: data.item.PowerData,
    rank: data.item.RankData,
  });
  Object.assign(CONFIG.ActiveEffect.dataModels, {
    ability: data.effect.AbilityData,
    attunement: data.effect.AttunementData,
    base: data.effect.BaseEffectData,
    consequence: data.effect.ConsequenceData,
    fluency: data.effect.FluencyData,
    property: data.effect.PropertyData,
    resource: data.effect.ResourceData,
  });
  Object.assign(CONFIG.ChatMessage.dataModels, {
    base: data.message.BaseChatMessageData,
  });

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
      label: "Character",
      types: ["character"],
      doc: documents.TeriockActor,
    },
    // Items
    {
      cls: applications.sheets.item.EquipmentSheet,
      label: "Equipment",
      types: ["equipment"],
      doc: documents.TeriockItem,
    },
    {
      cls: applications.sheets.item.RankSheet,
      label: "Rank",
      types: ["rank"],
      doc: documents.TeriockItem,
    },
    {
      cls: applications.sheets.item.PowerSheet,
      label: "Power",
      types: ["power"],
      doc: documents.TeriockItem,
    },
    // Effects
    {
      cls: applications.sheets.effect.AbilitySheet,
      label: "Ability",
      types: ["ability"],
      doc: documents.TeriockEffect,
    },
    {
      cls: applications.sheets.effect.FluencySheet,
      label: "Fluency",
      types: ["fluency"],
      doc: documents.TeriockEffect,
    },
    {
      cls: applications.sheets.effect.ResourceSheet,
      label: "Resource",
      types: ["resource"],
      doc: documents.TeriockEffect,
    },
    {
      cls: applications.sheets.effect.PropertySheet,
      label: "Property",
      types: ["property"],
      doc: documents.TeriockEffect,
    },
    {
      cls: applications.sheets.effect.ConsequenceSheet,
      label: "Consequence",
      types: ["consequence"],
      doc: documents.TeriockEffect,
      makeDefault: false,
    },
  ];
  sheetMap.forEach(({ cls, label, types, doc, makeDefault = true }) =>
    DocumentSheetConfig.registerSheet(doc, "teriock", cls, {
      makeDefault,
      label,
      types,
    }),
  );

  // Registering custom dice rolls and functions
  CONFIG.Dice.rolls.length = 0;
  CONFIG.Dice.rolls.push(documents.TeriockRoll);

  // Registering custom queries
  CONFIG.queries["teriock.inCombatExpiration"] =
    queries.inCombatExpirationQuery;

  const packs =
    /** @type {Collection<TeriockCompendiumCollection>} */ game.packs;

  game.teriock = {
    Actor: documents.TeriockActor,
    Message: documents.TeriockMessage,
    Combat: documents.TeriockCombat,
    Effect: documents.TeriockEffect,
    Item: documents.TeriockItem,
    Macro: documents.TeriockMacro,
    Roll: documents.TeriockRoll,
    Scene: documents.TeriockScene,
    Token: documents.TeriockToken,
    User: documents.TeriockUser,
    api: {
      create: {
        ability: createEffects.createAbility,
        consequence: createEffects.createConsequence,
        fluency: createEffects.createFluency,
        property: createEffects.createProperty,
        resource: createEffects.createResource,
      },
      dialog: {
        boost: dialogs.boostDialog,
        duration: dialogs.durationDialog,
        hotbarDrop: dialogs.hotbarDropDialog,
        inCombatExpiration: dialogs.inCombatExpirationDialog,
        select: dialogs.selectDialog,
        selectAbility: dialogs.selectAbilityDialog,
        selectCondition: dialogs.selectConditionDialog,
        selectEquipmentClass: dialogs.selectEquipmentClassDialog,
        selectProperty: dialogs.selectPropertyDialog,
        selectTradecraft: dialogs.selectTradecraftDialog,
        selectWeaponClass: dialogs.selectWeaponClassDialog,
      },
      import: {
        ability: createEffects.importAbility,
      },
      utils: {
        dedent: utils.dedent,
        fromUuid: utils.fromUuid,
        fromUuidSync: utils.fromUuidSync,
        pureUuid: utils.pureUuid,
        safeUuid: utils.safeUuid,
        toFeet: utils.toFeet,
        fromFeet: utils.fromFeet,
        convertUnits: utils.convertUnits,
      },
      wiki: {
        cleanWikiHTML: wiki.cleanWikiHTML,
        fetchCategoryAbilities: wiki.fetchCategoryAbilities,
        fetchCategoryMembers: wiki.fetchCategoryMembers,
        fetchWikiPageHTML: wiki.fetchWikiPageHTML,
        openWikiPage: wiki.openWikiPage,
      },
    },
    packs: {
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
      species: () =>
        /** @type {TeriockPowerCompendium} */
        packs.get("teriock.species"),
    },
  };

  // Register custom handlebars templates
  return registerTemplates();
});

for (const hook of Object.values(hooks)) {
  if (typeof hook === "function") {
    hook();
  }
}

for (const helper of Object.values(handlebars)) {
  if (typeof helper === "function") {
    helper();
  }
}
