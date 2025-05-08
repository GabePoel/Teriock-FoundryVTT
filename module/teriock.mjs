import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockActorSheet } from './sheets/actor-sheet.mjs';
import { TeriockAbilitySheet } from './sheets/ability-sheet.mjs';
import { TeriockEquipmentSheet } from './sheets/equipment-sheet.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { TERIOCK } from './helpers/config.mjs';
const { Actors, Items } = foundry.documents.collections;
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;

Hooks.once('init', function () {
  CONFIG.TERIOCK = TERIOCK;
  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 2,
  };

  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('teriock', TeriockActorSheet, {
    makeDefault: true,
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('teriock', TeriockAbilitySheet, {
    makeDefault: true,
    label: 'Ability',
    types: ['ability'],
  });
  Items.registerSheet('teriock', TeriockEquipmentSheet, {
    makeDefault: true,
    label: 'Equipment',
    types: ['equipment'],
  });


  game.teriock = {
    TeriockActor,
    TeriockItem,
  };



  // Define custom Document classes
  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;

  CONFIG.ActiveEffect.legacyTransferral = false;

  return preloadHandlebarsTemplates();
});


Hooks.on('updateItem', async (item, updateData, options, userId) => {
  console.log('updateItem', item, updateData, options, userId);
});


Handlebars.registerHelper('lc', function (str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.toLowerCase();
});

Handlebars.registerHelper('length', function (str) {
  if (typeof str !== 'string') {
    return 0;
  }
  return str.length;
});

Handlebars.registerHelper('exists', function (str) {
  if (Array.isArray(str)) {
    return str.length > 0;
  }
  if (typeof str === 'undefined' || str === null) {
    return false;
  }
  if (typeof str === 'string' && str.trim() === '') {
    return false;
  }
  if (typeof str === 'string' && str === '0') {
    return false;
  }
  if (typeof str === 'string' && str === '+0') {
    return false;
  }
  if (typeof str === 'number') {
    return str > 0;
  }
  return true;
});

Handlebars.registerHelper('firstDie', function (str) {
  const validDice = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
  for (const die of validDice) {
    if (str.includes(die)) {
      return 'dice-' + die;
    }
  }
  const validInts = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (const int of validInts) {
    const full = int + ' Damage'
    if (str.includes(full)) {
      return int;
    }
  }
  return 'dice';
});