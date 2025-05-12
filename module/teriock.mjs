import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockEffect } from './documents/effect.mjs';
import { TeriockCharacterSheet } from './sheets/character-sheet.mjs';
import { TeriockAbilitySheet } from './sheets/ability-sheet.mjs';
import { TeriockEquipmentSheet } from './sheets/equipment-sheet.mjs';
import { TeriockRankSheet } from './sheets/rank-sheet.mjs';
import { TeriockFluencySheet } from './sheets/fluency-sheet.mjs';
import { TeriockPowerSheet } from './sheets/power-sheet.mjs';
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

  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockAbilitySheet, { makeDefault: true });


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

Handlebars.registerHelper('ttoggle', function (bool) {
  if (bool) {
    return 'ttoggle-button toggled';
  } else {
    return 'ttoggle-button';
  }
});

Handlebars.registerHelper('tcard', function (options) {
  const { img, title, subtitle, text, icons, id, parentId, active = true, marker = null, shattered = false } = options.hash;

  const idAttr = id ? `data-id="${id}"` : '';
  const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : '';
  const activeClass = active ? 'active' : 'inactive';
  const markerStyle = marker ? `style="background-color: ${marker}; width: 4px;"` : '';
  const shatteredClass = shattered ? 'shattered' : '';

  return new Handlebars.SafeString(`
    <div class="tcard ${activeClass} ${shatteredClass}" ${idAttr} ${parentIdAttr}>
      <div class="tcard-marker" ${markerStyle}></div>
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
      <div class="tcard-background"></div>
    </div>
  `);
});

Handlebars.registerHelper('abilityCards', function (abilities, system, options) {
  const isGapless = system?.sheet?.display?.ability?.gapless;
  const sizeClass = system?.sheet?.display?.ability?.size || '';

  const containerClass = `tcard-container ${isGapless ? 'gapless' : ''} ${sizeClass}`.trim();

  const renderedCards = abilities.map(ability => {
    const subtitle = Handlebars.helpers.executionTime(
      ability.system?.maneuver,
      ability.system?.executionTime
    );

    const marker = Handlebars.helpers.abilityMarker(ability);

    const icons = Handlebars.helpers.concat(
      Handlebars.helpers.ticon("comment", {
        hash: {
          cssClass: "shareAbility",
          action: "share",
          id: ability._id,
          parentId: ability.parent?._id
        }
      })
    );

    return Handlebars.helpers.tcard({
      hash: {
        img: ability.img,
        title: ability.name,
        subtitle,
        text: ability.parent?.name,
        id: ability._id,
        parentId: ability.parent?._id,
        marker,
        icons
      }
    });
  }).join('\n');

  return new Handlebars.SafeString(`
    <div class="${containerClass}">
      ${renderedCards}
    </div>
  `);
});


Handlebars.registerHelper('equipmentMarker', function (item) {
  const powerLevel = item.system.powerLevel;
  return CONFIG.TERIOCK.equipmentOptions.powerLevel[powerLevel]?.color;
});

Handlebars.registerHelper('abilityMarker', function (effect) {
  const abilityType = effect.system.abilityType;
  return CONFIG.TERIOCK.abilityOptions.abilityType[abilityType]?.color;
});

Handlebars.registerHelper('tcardOptions', function (optionsToggle, filterToggle, searchValue, tab, options) {
  const escape = Handlebars.Utils.escapeExpression;
  const toggleHelper = Handlebars.helpers.ttoggle;
  const checkedHelper = Handlebars.helpers.checked;
  const selectOptionsHelper = Handlebars.helpers.selectOptions;

  const context = options.data.root;

  const inputName = `system.sheet.${tab}Filters.search`;
  const inputValue = escape(searchValue);

  const optionsPath = `system.sheet.menus.${tab}Options`;
  const filterPath = `system.sheet.menus.${tab}Filters`;

  const optionsClass = `${tab}-options-menu-toggle options-menu-toggle ${toggleHelper(optionsToggle)}`;
  const filterClass = `${tab}-filter-menu-toggle filter-menu-toggle ${toggleHelper(filterToggle)}`;

  const showFilterButton = filterToggle !== null && filterToggle !== undefined;

  const optionsButtonHTML = `
    <button class="${optionsClass}" data-bool="${optionsToggle}" data-path="${optionsPath}">
      <i class="fa-solid fa-sliders"></i>
    </button>
  `;

  const filterButtonHTML = showFilterButton ? `
    <button class="${filterClass}" data-bool="${filterToggle}" data-path="${filterPath}">
      <i class="fa-solid fa-filter"></i>
    </button>
  ` : '';

  // Paths to dynamic config values
  const gaplessPath = `system.sheet.display.${tab}.gapless`;
  const sizePath = `system.sheet.display.${tab}.size`;

  // Resolve dynamic values from context
  const gaplessValue = gaplessPath.split('.').reduce((obj, key) => obj?.[key], context);
  const sizeValue = sizePath.split('.').reduce((obj, key) => obj?.[key], context);
  const sizeOptions = context.config?.displayOptions?.sizes ?? {};

  const gaplessChecked = checkedHelper(gaplessValue);
  const sizeSelectHTML = selectOptionsHelper(sizeOptions, { hash: { selected: sizeValue } });

  return new Handlebars.SafeString(`
    <div class="tcard-options-header">
      ${optionsButtonHTML}
      ${filterButtonHTML}
      <input type="text" name="${inputName}" placeholder="Search" value="${inputValue}">
    </div>

    ${optionsToggle ? `
      <div class="tcard-options-content">
        <div class="tgrid g4">
          <div class="tgrid-item">
            <label for="${tab}-gapless">Gapless</label>
            <input type="checkbox" name="system.sheet.display.${tab}.gapless" id="${tab}-gapless" ${gaplessChecked}>
          </div>
          <div class="tgrid-item gi3">
            <select name="system.sheet.display.${tab}.size" id="${tab}-size">
              <option value="">Card Size</option>
              ${sizeSelectHTML}
            </select>
          </div>
        </div>
      </div>
    ` : ''}
  `);
});

Handlebars.registerHelper('dotJoin', function (...args) {
  const options = args.pop();
  const separator = '&nbsp;&nbsp;·&nbsp;&nbsp;';
  const result = args
    .filter(arg => typeof arg === 'string' && arg.length > 0)
    .join(separator);
  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('eachExceptLast', function (context, options) {
  let out = '';
  for (let i = 0; i < context.length - 1; i++) {
    out += options.fn(context[i]);
  }
  return out;
});
