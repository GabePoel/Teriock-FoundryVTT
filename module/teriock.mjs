import TERIOCK from './helpers/config.mjs';
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;
import { conditions } from './content/conditions.mjs'
import { TeriockAbilitySheet } from './sheets/effects/ability-sheet.mjs';
import { TeriockBaseEffectSheet } from './sheets/effects/base-sheet.mjs';
import { TeriockCharacterSheet } from './sheets/character-sheet.mjs';
import { teriockDetectionModes } from './perception/detection-modes.mjs';
import { TeriockEquipmentSheet } from './sheets/items/equipment-sheet.mjs';
import { TeriockEquipmentData } from './data/items/equipment.mjs';
import { TeriockFluencySheet } from './sheets/effects/fluency-sheet.mjs';
import { TeriockPowerSheet } from './sheets/items/power-sheet.mjs';
import { TeriockPowerData } from './data/items/power.mjs';
import { TeriockPropertySheet } from './sheets/effects/property-sheet.mjs';
import { TeriockRankData } from './data/items/rank.mjs';
import { TeriockRankSheet } from './sheets/items/rank-sheet.mjs';
import { TeriockResourceSheet } from './sheets/effects/resource-sheet.mjs';
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
  Object.assign(CONFIG.Item.dataModels, {
    equipment: TeriockEquipmentData,
    power: TeriockPowerData,
    rank: TeriockRankData,
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
      cls: TeriockBaseEffectSheet,
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
    TeriockItem,
    TeriockEffect,
    TeriockToken,
    TeriockRoll,
    TeriockHarmRoll,
  };

  // Register custom handlebars templates
  return registerTemplates();
});

registerHooks();
registerHandlebarsHelpers();