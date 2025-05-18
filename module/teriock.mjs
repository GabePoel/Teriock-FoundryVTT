import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockEffect } from './documents/effect.mjs';
import { TeriockCharacterSheet } from './sheets/character-sheet.mjs';
import { TeriockAbilitySheet } from './sheets/ability-sheet.mjs';
import { TeriockResourceSheet } from './sheets/resource-sheet.mjs';
import { TeriockEquipmentSheet } from './sheets/equipment-sheet.mjs';
import { TeriockRankSheet } from './sheets/rank-sheet.mjs';
import { TeriockFluencySheet } from './sheets/fluency-sheet.mjs';
import { TeriockPowerSheet } from './sheets/power-sheet.mjs';
import { TeriockRoll } from './dice/roll.mjs'
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { registerHandlebarsHelpers } from './helpers/register-handlebars.mjs';
import { TERIOCK } from './helpers/config.mjs';
const { Actors, Items } = foundry.documents.collections;
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;

Hooks.once('init', function () {
  CONFIG.TERIOCK = TERIOCK;
  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 2,
  };

  CONFIG.Dice.rolls.push(TeriockRoll);
  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;
  CONFIG.ActiveEffect.documentClass = TeriockEffect;

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('teriock', TeriockCharacterSheet, {
    makeDefault: true,
    label: 'Character',
    types: ['character'],
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('teriock', TeriockEquipmentSheet, {
    makeDefault: true,
    label: 'Equipment',
    types: ['equipment'],
  });
  Items.registerSheet('teriock', TeriockFluencySheet, {
    makeDefault: true,
    label: 'Fluency',
    types: ['fluency'],
  });
  Items.registerSheet('teriock', TeriockRankSheet, {
    makeDefault: true,
    label: 'Rank',
    types: ['rank'],
  });
  Items.registerSheet('teriock', TeriockPowerSheet, {
    makeDefault: true,
    label: 'Power',
    types: ['power'],
  });

  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockAbilitySheet, {
    makeDefault: true,
    label: 'Ability',
    types: ['ability']
  });

  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockResourceSheet, {
    makeDefault: true,
    label: 'Resource',
    types: ['resource']
  });


  game.teriock = {
    TeriockActor,
    TeriockItem,
    TeriockEffect,
  };

  console.log(game)

  // Define custom Document classes
  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;

  CONFIG.ActiveEffect.legacyTransferral = false;

  return preloadHandlebarsTemplates();
});


Hooks.on('updateItem', async (item, updateData, options, userId) => {
  console.log('updateItem', item, updateData, options, userId);
});


registerHandlebarsHelpers();