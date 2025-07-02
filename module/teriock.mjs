import TERIOCK from "./helpers/config.mjs";
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;
import { conditions } from "./content/conditions.mjs";
import { teriockDetectionModes } from "./perception/detection-modes.mjs";
import { teriockVisionModes } from "./perception/vision-modes.mjs";
import * as data from "./data/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as sheets from "./sheets/_module.mjs";
import registerHandlebarsHelpers from "./helpers/startup/register-handlebars.mjs";
import registerHooks from "./helpers/startup/register-hooks.mjs";
import registerTemplates from "./helpers/startup/register-templates.mjs";

Hooks.once("init", function () {
  CONFIG.TERIOCK = TERIOCK;

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
  CONFIG.Actor.documentClass = documents.TeriockActor;
  CONFIG.Item.documentClass = documents.TeriockItem;
  CONFIG.ActiveEffect.documentClass = documents.TeriockEffect;
  CONFIG.Token.documentClass = documents.TeriockToken;

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
    effect: data.effect.EffectData,
    fluency: data.effect.FluencyData,
    property: data.effect.PropertyData,
    resource: data.effect.ResourceData,
  });

  // Legacy transferral
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Unregister V1 sheets
  DocumentSheetConfig.unregisterSheet(documents.TeriockActor, "teriock", ActorSheet);
  DocumentSheetConfig.unregisterSheet(documents.TeriockItem, "teriock", ItemSheet);

  // Register custom sheets
  const sheetMap = [
    // Actors
    {
      cls: sheets.actor.CharacterSheet,
      label: "Character",
      types: ["character"],
      doc: documents.TeriockActor,
    },
    // Items
    {
      cls: sheets.item.EquipmentSheet,
      label: "Equipment",
      types: ["equipment"],
      doc: documents.TeriockItem,
    },
    {
      cls: sheets.item.RankSheet,
      label: "Rank",
      types: ["rank"],
      doc: documents.TeriockItem,
    },
    {
      cls: sheets.item.PowerSheet,
      label: "Power",
      types: ["power"],
      doc: documents.TeriockItem,
    },
    // Effects
    {
      cls: sheets.effect.AbilitySheet,
      label: "Ability",
      types: ["ability"],
      doc: documents.TeriockEffect,
    },
    {
      cls: sheets.effect.FluencySheet,
      label: "Fluency",
      types: ["fluency"],
      doc: documents.TeriockEffect,
    },
    {
      cls: sheets.effect.ResourceSheet,
      label: "Resource",
      types: ["resource"],
      doc: documents.TeriockEffect,
    },
    {
      cls: sheets.effect.PropertySheet,
      label: "Property",
      types: ["property"],
      doc: documents.TeriockEffect,
    },
    {
      cls: sheets.effect.EffectSheet,
      label: "Effect",
      types: ["effect"],
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
  CONFIG.Dice.rolls = [documents.TeriockRoll, documents.TeriockHarmRoll];

  game.teriock = {
    TeriockActor: documents.TeriockActor,
    TeriockEffect: documents.TeriockEffect,
    TeriockHarmRoll: documents.TeriockHarmRoll,
    TeriockItem: documents.TeriockItem,
    TeriockRoll: documents.TeriockRoll,
    TeriockToken: documents.TeriockToken,
  };

  // Register custom handlebars templates
  return registerTemplates();
});

registerHooks();
registerHandlebarsHelpers();
