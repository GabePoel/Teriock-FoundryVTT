import * as applications from "./applications/_module.mjs";
import * as dialogs from "./applications/dialogs/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import * as perception from "./canvas/perception/_module.mjs";
import { conditions } from "./content/conditions.mjs";
import * as data from "./data/_module.mjs";
import * as documents from "./documents/_module.mjs";
import TERIOCK from "./helpers/config.mjs";
import * as createEffects from "./helpers/create-effects.mjs";
import * as fetch from "./helpers/fetch.mjs";
import * as handlebars from "./helpers/handlebars/_module.mjs";
import * as hooks from "./helpers/hooks/_module.mjs";
import * as queries from "./helpers/queries/_module.mjs";
import registerTemplates from "./helpers/register-templates.mjs";
import * as utils from "./helpers/utils.mjs";
import * as wiki from "./helpers/wiki.mjs";

const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;

foundry.helpers.Hooks.once("init", function () {
  CONFIG.TERIOCK = TERIOCK;

  CONFIG.ui.hotbar = applications.ui.TeriockHotbar;

  applications.ux.registerEnrichers();

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
  CONFIG.specialStatusEffects["TRANSFORMED"] = "transformed";

  CONFIG.Canvas.visionModes = {
    ...CONFIG.Canvas.visionModes,
    ...perception.visionModes,
  };
  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    const id = CONFIG.Canvas.detectionModes[key].id;
    if (!["basicSight", "lightPerception"].includes(id)) {
      delete CONFIG.Canvas.detectionModes[key];
    }
  }
  CONFIG.Canvas.detectionModes = {
    ...CONFIG.Canvas.detectionModes,
    ...perception.detectionModes,
  };

  // Register custom core placeables
  CONFIG.Token.objectClass = canvas.placeables.TeriockToken;

  // Register custom core documents
  CONFIG.ActiveEffect.documentClass = documents.TeriockEffect;
  CONFIG.Actor.documentClass = documents.TeriockActor;
  CONFIG.ChatMessage.documentClass = documents.TeriockMessage;
  CONFIG.Combat.documentClass = documents.TeriockCombat;
  CONFIG.Item.documentClass = documents.TeriockItem;
  CONFIG.Macro.documentClass = documents.TeriockMacro;
  CONFIG.Scene.documentClass = documents.TeriockScene;
  CONFIG.Token.documentClass = documents.TeriockTokenDocument;
  CONFIG.User.documentClass = documents.TeriockUser;

  // Data models
  Object.assign(CONFIG.Actor.dataModels, {
    character: data.actor.CharacterData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    equipment: data.item.EquipmentData,
    power: data.item.PowerData,
    rank: data.item.RankData,
    mechanic: data.item.MechanicData,
  });
  Object.assign(CONFIG.ActiveEffect.dataModels, {
    ability: data.effect.AbilityData,
    attunement: data.effect.AttunementData,
    base: data.effect.BaseEffectData,
    condition: data.effect.ConditionData,
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
      doc: documents.TeriockActor,
      label: "Character",
      types: ["character"],
    },
    // Items
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
  CONFIG.Dice.rolls.push(documents.TeriockRoll);

  // Modifying index fields
  CONFIG.ActiveEffect.IndexFields = [
    "system.hierarchy.rootUuid",
    "system.hierarchy.subIds",
    "system.hierarchy.supId",
  ];

  // Registering custom queries
  Object.assign(CONFIG.queries, {
    "teriock.addToSustaining": queries.addToSustainingQuery,
    "teriock.inCombatExpiration": queries.inCombatExpirationQuery,
    "teriock.sustainedExpiration": queries.sustainedExpirationQuery,
  });

  const packs =
    /** @type {Collection<string,TeriockCompendiumCollection>} */ game.packs;

  game.teriock = {
    Actor: documents.TeriockActor,
    Combat: documents.TeriockCombat,
    Effect: documents.TeriockEffect,
    Item: documents.TeriockItem,
    Macro: documents.TeriockMacro,
    Message: documents.TeriockMessage,
    Roll: documents.TeriockRoll,
    Scene: documents.TeriockScene,
    Token: documents.TeriockTokenDocument,
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
        goadedTo: dialogs.goadedToDialog,
        hotbarDrop: dialogs.hotbarDropDialog,
        inCombatExpiration: dialogs.inCombatExpirationDialog,
        lightedTo: dialogs.lightedToDialog,
        select: dialogs.selectDialog,
        selectAbility: dialogs.selectAbilityDialog,
        selectCondition: dialogs.selectConditionDialog,
        selectEquipmentClass: dialogs.selectEquipmentClassDialog,
        selectEquipmentType: dialogs.selectEquipmentTypeDialog,
        selectProperty: dialogs.selectPropertyDialog,
        selectTokens: dialogs.selectTokensDialog,
        selectTradecraft: dialogs.selectTradecraftDialog,
        selectWeaponClass: dialogs.selectWeaponClassDialog,
      },
      utils: {
        convertUnits: utils.convertUnits,
        copyAbility: fetch.copyAbility,
        copyItem: fetch.copyItem,
        copyProperty: fetch.copyProperty,
        copyRank: fetch.copyRank,
        dedent: utils.dedent,
        fromFeet: utils.fromFeet,
        getAbility: fetch.getAbility,
        getItem: fetch.getItem,
        getProperty: fetch.getProperty,
        getRank: fetch.getRank,
        importAbility: fetch.importAbility,
        importProperty: fetch.importProperty,
        pureUuid: utils.pureUuid,
        refreshDocuments: utils.refreshDocuments,
        safeUuid: utils.safeUuid,
        toCamelCase: utils.toCamelCase,
        toFeet: utils.toFeet,
        toKebabCase: utils.toKebabCase,
        toTitleCase: utils.toTitleCase,
      },
      wiki: {
        cleanWikiHTML: wiki.cleanWikiHTML,
        fetchCategoryAbilities: wiki.fetchCategoryAbilities,
        fetchCategoryMembers: wiki.fetchCategoryMembers,
        fetchNamespacePages: wiki.fetchNamespacePages,
        fetchWikiPageHTML: wiki.fetchWikiPageHTML,
        openWikiPage: wiki.openWikiPage,
      },
    },
    packs: {
      rules: () =>
        /** @type {TeriockJournalCompendium} */
        packs.get("teriock.rules"),
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
