import TERIOCK from './helpers/config.mjs';
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;
import { conditions } from './content/conditions.mjs'
import { TeriockAbilityData } from './data/effect-data/ability-data/ability-data.mjs';
import { TeriockAbilitySheet } from './sheets/effect-sheets/ability-sheet/ability-sheet.mjs';
import { TeriockCharacterData } from './data/actor-data/character-data/character-data.mjs';
import { TeriockCharacterSheet } from './sheets/actor-sheets/character-sheet/character-sheet.mjs';
import { teriockDetectionModes } from './perception/detection-modes.mjs';
import { TeriockEffectData } from './data/effect-data/effect-data/effect-data.mjs';
import { TeriockEffectSheet } from './sheets/effect-sheets/effect-sheet/effect-sheet.mjs';
import { TeriockEquipmentData } from './data/item-data/equipment-data/equipment-data.mjs';
import { TeriockEquipmentSheet } from './sheets/item-sheets/equipment-sheet/equipment-sheet.mjs';
import { TeriockFluencyData } from './data/effect-data/fluency-data/fluency-data.mjs';
import { TeriockFluencySheet } from './sheets/effect-sheets/fluency-sheet/fluency-sheet.mjs';
import { TeriockPowerData } from './data/item-data/power-data/power-data.mjs';
import { TeriockPowerSheet } from './sheets/item-sheets/power-sheet/power-sheet.mjs';
import { TeriockPropertyData } from './data/effect-data/property-data/property-data.mjs';
import { TeriockPropertySheet } from './sheets/effect-sheets/property-sheet/property-sheet.mjs';
import { TeriockRankData } from './data/item-data/rank-data/rank-data.mjs';
import { TeriockRankSheet } from './sheets/item-sheets/rank-sheet/rank-sheet.mjs';
import { TeriockResourceData } from './data/effect-data/resource-data/resource-data.mjs';
import { TeriockResourceSheet } from './sheets/effect-sheets/resource-sheet/resource-sheet.mjs';
import { teriockVisionModes } from './perception/vision-modes.mjs';
import registerHandlebarsHelpers from './helpers/startup/register-handlebars.mjs';
import registerHooks from './helpers/startup/register-hooks.mjs';
import registerTemplates from './helpers/startup/register-templates.mjs';
import TeriockActor from './documents/actor.mjs';
import TeriockEffect from './documents/effect.mjs';
import TeriockHarmRoll from './documents/harm.mjs';
import TeriockItem from './documents/item.mjs';
import TeriockRoll from './documents/roll.mjs'
import TeriockToken from './documents/token.mjs';

Hooks.once('init', function () {
  CONFIG.TERIOCK = TERIOCK;

  CONFIG.Combat.initiative = {
    formula: '1d20 + @mov',
    decimals: 2,
  };

  CONFIG.statusEffects = [];
  for (const condition of Object.values(conditions)) {
    CONFIG.statusEffects.push(condition);
  }
  CONFIG.statusEffects.sort((a, b) => {
    if (a.id === 'dead') return -1;
    if (b.id === 'dead') return 1;
    if (a.id === 'unconscious') return b.id === 'dead' ? 1 : -1;
    if (b.id === 'unconscious') return a.id === 'dead' ? -1 : 1;
    if (a.id === 'down') {
      if (b.id === 'dead' || b.id === 'unconscious') return 1;
      return -1;
    }
    if (b.id === 'down') {
      if (a.id === 'dead' || a.id === 'unconscious') return -1;
      return 1;
    }
    return a.id.localeCompare(b.id);
  });

  CONFIG.Canvas.visionModes = {
    ...CONFIG.Canvas.visionModes,
    ...teriockVisionModes,
  };
  for (const key of Object.keys(CONFIG.Canvas.detectionModes)) {
    if (CONFIG.Canvas.detectionModes[key]?.id !== 'basicSight') {
      delete CONFIG.Canvas.detectionModes[key];
    }
  }
  CONFIG.Canvas.detectionModes = {
    ...CONFIG.Canvas.detectionModes,
    ...teriockDetectionModes,
  };

  // Register custom documents
  CONFIG.Dice.rolls.push(TeriockRoll);
  CONFIG.Dice.rolls.push(TeriockHarmRoll);
  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;
  CONFIG.ActiveEffect.documentClass = TeriockEffect;
  CONFIG.Token.documentClass = TeriockToken;

  // Data models
  Object.assign(CONFIG.Actor.dataModels, {
    character: TeriockCharacterData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    equipment: TeriockEquipmentData,
    power: TeriockPowerData,
    rank: TeriockRankData,
  })
  console.log(TeriockResourceData);
  Object.assign(CONFIG.ActiveEffect.dataModels, {
    ability: TeriockAbilityData,
    effect: TeriockEffectData,
    fluency: TeriockFluencyData,
    property: TeriockPropertyData,
    resource: TeriockResourceData,
  })

  // Legacy transferral
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Unregister V1 sheets
  DocumentSheetConfig.unregisterSheet(TeriockActor, 'teriock', ActorSheet);
  DocumentSheetConfig.unregisterSheet(TeriockItem, 'teriock', ItemSheet);

  // Register custom sheets
  const sheets = [
    // Actors
    {
      cls: TeriockCharacterSheet,
      label: 'Character',
      types: ['character'],
      doc: TeriockActor
    },
    // Items
    {
      cls: TeriockEquipmentSheet,
      label: 'Equipment',
      types: ['equipment'],
      doc: TeriockItem
    },
    {
      cls: TeriockRankSheet,
      label: 'Rank',
      types: ['rank'],
      doc: TeriockItem
    },
    {
      cls: TeriockPowerSheet,
      label: 'Power',
      types: ['power'],
      doc: TeriockItem
    },
    // Effects
    {
      cls: TeriockAbilitySheet,
      label: 'Ability',
      types: ['ability'],
      doc: TeriockEffect
    },
    {
      cls: TeriockFluencySheet,
      label: 'Fluency',
      types: ['fluency'],
      doc: TeriockEffect
    },
    {
      cls: TeriockResourceSheet,
      label: 'Resource',
      types: ['resource'],
      doc: TeriockEffect
    },
    {
      cls: TeriockPropertySheet,
      label: 'Property',
      types: ['property'],
      doc: TeriockEffect
    },
    {
      cls: TeriockEffectSheet,
      label: 'Effect',
      types: ['effect'],
      doc: TeriockEffect,
      makeDefault: false
    }
  ];
  sheets.forEach(({ cls, label, types, doc, makeDefault = true }) =>
    DocumentSheetConfig.registerSheet(doc, 'teriock', cls, {
      makeDefault, label, types
    })
  );

  game.teriock = {
    TeriockActor,
    TeriockEffect,
    TeriockHarmRoll,
    TeriockItem,
    TeriockRoll,
    TeriockToken,
  };

  // Register custom handlebars templates
  return registerTemplates();
});

registerHooks();
registerHandlebarsHelpers();