import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockEffect } from './documents/effect.mjs';
import { TeriockCharacterSheet } from './sheets/character-sheet.mjs';
import { TeriockAbilitySheet } from './sheets/ability-sheet.mjs';
import { TeriockEquipmentSheet } from './sheets/equipment-sheet.mjs';
import { TeriockRankSheet } from './sheets/rank-sheet.mjs';
import { TeriockFluencySheet } from './sheets/fluency-sheet.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
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

  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;
  // CONFIG.ActiveEffect.documentClass =
  CONFIG.ActiveEffect.documentClass = TeriockEffect;

    Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('teriock', TeriockCharacterSheet, {
    makeDefault: true,
    label: 'Character',
    types: ['character'],
  });
  Items.unregisterSheet('core', ItemSheet);
  // ActiveEffects.registerSheet('teriock', TeriockAbilitySheet, {
  //   makeDefault: true,
  //   label: 'Ability',
  //   types: ['ability'],
  // });
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

  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockAbilitySheet, {makeDefault: true});


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

Handlebars.registerHelper('barLeft', function (value, max, temp = 0) {
  if (value === undefined || max === undefined) {
    return 0;
  }
  if (value < 0) {
    value = 0;
  }
  if (max < 0) {
    max = 0;
  }
  if (temp < 0) {
    temp = 0;
  }
  const percentLeft = Math.floor((value / (max + temp)) * 100);
  return percentLeft;
});

Handlebars.registerHelper('barTemp', function (value, max, temp = 0) {
  if (value === undefined || max === undefined) {
    return 0;
  }
  if (value < 0) {
    value = 0;
  }
  if (max < 0) {
    max = 0;
  }
  if (temp < 0) {
    temp = 0;
  }
  const percentTemp = Math.ceil((temp / (max + temp)) * 100);
  return percentTemp;
});

Handlebars.registerHelper('barLost', function (value, max, temp = 0) {
  console.log('barLost', value, max, temp);
  if (value === undefined || max === undefined) {
    return 0;
  }
  if (value < 0) {
    value = 0;
  }
  if (max < 0) {
    max = 0;
  }
  if (temp < 0) {
    temp = 0;
  }
  const percentLeft = Math.floor((value / (max + temp)) * 100);
  const percentTemp = Math.ceil((temp / (max + temp)) * 100);
  return 100 - percentLeft - percentTemp;
});

Handlebars.registerHelper('tabActive', function (active, tab) {
  if (active === tab) {
    return 'active';
  }
  return 'inactive';
});

Handlebars.registerHelper('className', function (classArchetype, className) {
  return CONFIG.TERIOCK.rankOptions[classArchetype].classes[className].name;
});

Handlebars.registerHelper('classArchetype', function (classArchetype) {
  return CONFIG.TERIOCK.rankOptions[classArchetype].name;
});

Handlebars.registerHelper('executionTime', function (maneuver, executionTime) {
  const time = CONFIG.TERIOCK.abilityOptions.executionTime[maneuver]?.[executionTime] ?? null;
  if (time) {
    return time;
  }
  return executionTime;
});

Handlebars.registerHelper('tradecraft', function (field, tradecraft) {
  return CONFIG.TERIOCK.tradecraftOptions[field].tradecrafts[tradecraft].name;
});

Handlebars.registerHelper('field', function (field) {
  return CONFIG.TERIOCK.tradecraftOptions[field].name;
});

Handlebars.registerHelper('ticon', function (icon, options) {
  const { cssClass = '', id, parentId, action } = options.hash;

  const idAttr = id ? `data-id="${id}"` : '';
  const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : '';
  const actionAttr = action ? `data-action="${action}"` : '';

  return new Handlebars.SafeString(`
    <i class="${cssClass} fa-light fa-${icon}" ${idAttr} ${parentIdAttr} ${actionAttr}></i>
  `);
});

Handlebars.registerHelper('ticonToggle', function (iconTrue, iconFalse, bool, options) {
  const { cssClass = '', id, parentId, action } = options.hash;

  const idAttr = id ? `data-id="${id}"` : '';
  const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : '';
  const actionAttr = action ? `data-action="${action}"` : '';

  const icon = bool ? iconTrue : iconFalse;

  return new Handlebars.SafeString(`
    <i class="${cssClass} fa-light fa-${icon}" ${idAttr} ${parentIdAttr} ${actionAttr}></i>
  `);
});

Handlebars.registerHelper('tcard', function (options) {
  const { img, title, subtitle, text, icons, id, parentId } = options.hash;

  return new Handlebars.SafeString(`
    <div class="tcard" data-id="${id}" data-parent-id="${parentId}">
      <div class="tcard-image">
        <img src="${img}" alt="${title}" />
      </div>
      <div class="tcard-body">
        <div class="tcard-titles">
          <div class="tcard-title">${title}</div>
          <div class="tcard-subtitle">${subtitle}</div>
        </div>
        <div class="tcard-content">
          <div class="tcard-text">
            ${text}
          </div>
          <div class="tcard-icons">
            ${icons || ''}
          </div>
        </div>
      </div>
    </div>
  `);
});
