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
import { TeriockHarmRoll } from './dice/harm.mjs';
import { TeriockElderSorceryRoll } from './dice/elder-sorcery.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { registerHandlebarsHelpers } from './helpers/register-handlebars.mjs';
import { TERIOCK } from './helpers/config.mjs';
import { conditions } from './content/conditions.mjs'
const { Actors, Items } = foundry.documents.collections;
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;

Hooks.once('init', function () {
  CONFIG.TERIOCK = TERIOCK;

  CONFIG.Combat.initiative = {
    formula: '1d20 + @mov',
    decimals: 2,
  };

  CONFIG.statusEffects = []
  for (const condition of Object.values(conditions)) {
    CONFIG.statusEffects.push(condition);
  }

  CONFIG.Dice.rolls.push(TeriockRoll);
  CONFIG.Dice.rolls.push(TeriockHarmRoll);
  CONFIG.Dice.rolls.push(TeriockElderSorceryRoll);
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

  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;

  CONFIG.ActiveEffect.legacyTransferral = false;

  return preloadHandlebarsTemplates();
});


// Hooks.on('updateItem', async (item, updateData, options, userId) => {
//   console.log('updateItem', item, updateData, options, userId);
// });

Hooks.on('combatTurnChange', async (combat, prior, current) => {
  const combatants = combat.combatants;
  for (const combatant of combatants) {
    const actor = combatant.actor;
    if (actor) {
      await actor.update({
        'system.attackPenalty': 0,
      });
    }
  }
});

Hooks.on('renderChatMessageHTML', (message, html, context) => {
  console.log('renderChatMessageHTML', message, html, context);
  const buttons = html.querySelectorAll('.harm-button');
  buttons.forEach(button => {
    if (button) {
      button.addEventListener('click', async (event) => {
        const data = event.currentTarget.dataset;
        const amount = parseInt(data.amount);
        const type = data.type || 'damage';
        const targets = game.user.targets;

        for (const target of targets) {
          const actor = target.actor;
          if (!actor) continue;
          if (type === 'damage') {
            await actor.takeDamage(amount);
          } else if (type === 'drain') {
            await actor.takeDrain(amount);
          } else if (type === 'wither') {
            await actor.takeWither(amount);
          }
        }
      });
    }
  });
});



Hooks.on("hotbarDrop", async (bar, data, slot) => {
  setTimeout(async () => {
    const item = await fromUuid(data.uuid);
    if (!item || typeof item.roll !== "function") return;

    const macroName = `Roll ${item.name}`;
    const command = `
const item = await fromUuid("${item.uuid}");
if (!item) return ui.notifications.warn("Item not found: ${item.name}");

const options = {
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey
};

await item.roll(options);
`;

    let macro = game.macros.find(m => m.name === macroName && m.command === command);
    if (!macro) {
      macro = await Macro.create({
        name: macroName,
        type: "script",
        img: item.img,
        command,
        flags: { "teriock": { itemMacro: true } }
      });
    }

    await game.user.assignHotbarMacro(macro, slot);
  }, 50);

  return false;
});


registerHandlebarsHelpers();