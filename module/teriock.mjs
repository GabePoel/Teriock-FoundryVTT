import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockActorSheet } from './sheets/actor-sheet.mjs';
import { TeriockItemSheet } from './sheets/item-sheet.mjs';
import { AbilitySheet } from './sheets/ability-sheet.mjs';
import { AbilitySheetV2 } from './sheets/ability-sheet-v2.mjs';
import { EquipmentItemSheet } from './sheets/equipment-sheet.mjs';
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
  Items.registerSheet('teriock', AbilitySheet, {
    label: 'Ability V1',
  });
  Items.registerSheet('teriock', AbilitySheetV2, {
    makeDefault: true,
    label: 'Ability V2',
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
  return true;
});