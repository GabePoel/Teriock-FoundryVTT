import TERIOCK from './helpers/config.mjs';
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;
import { conditions } from './content/conditions.mjs'
import { TeriockAbilitySheet } from './sheets/effects/ability-sheet.mjs';
import { TeriockBaseEffectSheet } from './sheets/effects/base-sheet.mjs';
import { TeriockCharacterData } from './data/actors/character.mjs';
import { TeriockCharacterSheet } from './sheets/actors/character-sheet.mjs';
import { TeriockEffectData } from './data/effects/base.mjs';
import { TeriockEquipmentData } from './data/items/equipment.mjs';
import { TeriockEquipmentSheet } from './sheets/items/equipment-sheet.mjs';
import { TeriockFluencyData } from './data/effects/fluency.mjs';
import { TeriockFluencySheet } from './sheets/effects/fluency-sheet.mjs';
import { TeriockPowerData } from './data/items/power.mjs';
import { TeriockPowerSheet } from './sheets/items/power-sheet.mjs';
import { TeriockPropertyData } from './data/effects/property.mjs';
import { TeriockPropertySheet } from './sheets/effects/property-sheet.mjs';
import { TeriockRankData } from './data/items/rank.mjs';
import { TeriockRankSheet } from './sheets/items/rank-sheet.mjs';
import { TeriockResourceData } from './data/effects/resource.mjs';
import { TeriockResourceSheet } from './sheets/effects/resource-sheet.mjs';
import { teriockDetectionModes } from './perception/detection-modes.mjs';
import { teriockVisionModes } from './perception/vision-modes.mjs';
import registerHandlebarsHelpers from './helpers/startup/register-handlebars.mjs';
import registerHooks from './helpers/startup/register-hooks.mjs';
import registerTemplates from './helpers/startup/register-templates.mjs';
import TeriockActor from './documents/actor.mjs';
import TeriockEffect from './documents/effects/base.mjs';
import TeriockEffectProxy from './documents/effect-proxy.mjs';
import TeriockHarmRoll from './documents/harm.mjs';
import TeriockItemProxy from './documents/item-proxy.mjs';
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
  CONFIG.Item.documentClass = TeriockItemProxy;
  CONFIG.ActiveEffect.documentClass = TeriockEffectProxy;
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
    effect: TeriockEffectData,
    fluency: TeriockFluencyData,
    property: TeriockPropertyData,
    resource: TeriockResourceData,
  })

  // Legacy transferral
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Unregister V1 sheets
  DocumentSheetConfig.unregisterSheet(TeriockActor, 'teriock', ActorSheet);
  DocumentSheetConfig.unregisterSheet(TeriockItemProxy, 'teriock', ItemSheet);

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
      doc: TeriockItemProxy
    },
    {
      cls: TeriockRankSheet,
      label: 'Rank',
      types: ['rank'],
      doc: TeriockItemProxy
    },
    {
      cls: TeriockPowerSheet,
      label: 'Power',
      types: ['power'],
      doc: TeriockItemProxy
    },
    // Effects
    {
      cls: TeriockAbilitySheet,
      label: 'Ability',
      types: ['ability'],
      doc: TeriockEffectProxy
    },
    {
      cls: TeriockFluencySheet,
      label: 'Fluency',
      types: ['fluency'],
      doc: TeriockEffectProxy
    },
    {
      cls: TeriockResourceSheet,
      label: 'Resource',
      types: ['resource'],
      doc: TeriockEffectProxy
    },
    {
      cls: TeriockPropertySheet,
      label: 'Property',
      types: ['property'],
      doc: TeriockEffectProxy
    },
    {
      cls: TeriockBaseEffectSheet,
      label: 'Effect',
      types: ['effect'],
      doc: TeriockEffectProxy,
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
    TeriockItemProxy,
    TeriockEffectProxy,
    TeriockToken,
    TeriockRoll,
    TeriockHarmRoll,
  };

  // Register custom handlebars templates
  return registerTemplates();
});

registerHooks();
registerHandlebarsHelpers();