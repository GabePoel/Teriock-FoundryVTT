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
import { TeriockImage } from './helpers/image.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { registerHandlebarsHelpers } from './helpers/register-handlebars.mjs';
import { TERIOCK } from './helpers/config.mjs';
import { conditions } from './content/conditions.mjs'
const { ux } = foundry.applications;
const { Actors, Items } = foundry.documents.collections;
const { ActorSheet, ItemSheet } = foundry.appv1.sheets;
const { DocumentSheetConfig } = foundry.applications.apps;

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

Hooks.on('chatMessage', (chatLog, message, chatData) => {
  const sender = game.users.get(chatData.user);
  const targets = sender?.targets;
  const actors = targets.map(target => target.actor);

  if (message.startsWith('/harm')) {
    const rollFormula = message.split('/harm')[1].trim();
    (async () => {
      const roll = new TeriockHarmRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Harm Roll`,
      });
    })().catch(console.error);
    return false;
  }

  if (message.startsWith('/damage')) {
    const rollFormula = message.split('/damage')[1].trim();
    (async () => {
      const roll = new TeriockRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Damage Roll`,
      });
      const total = roll.total;
      for (const actor of actors) {
        await actor.takeDamage(total);
      }
    })().catch(console.error);
    return false;
  }

  if (message.startsWith('/drain')) {
    const rollFormula = message.split('/drain')[1].trim();
    (async () => {
      const roll = new TeriockRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Drain Roll`,
      });
      const total = roll.total;
      for (const actor of actors) {
        await actor.takeDrain(total);
      }
    })().catch(console.error);
    return false;
  }

  if (message.startsWith('/wither')) {
    const rollFormula = message.split('/wither')[1].trim();
    (async () => {
      const roll = new TeriockRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Wither Roll`,
      });
      const total = roll.total;
      for (const actor of actors) {
        await actor.takeWither(total);
      }
    })().catch(console.error);
    return false;
  }

  if (message.startsWith('/heal')) {
    const rollFormula = message.split('/heal')[1].trim();
    (async () => {
      const roll = new TeriockRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Heal Roll`,
      });
      const total = roll.total;
      for (const actor of actors) {
        await actor.heal(total);
      }
    })().catch(console.error);
    return false;
  }

  if (message.startsWith('/revitalize')) {
    const rollFormula = message.split('/revitalize')[1].trim();
    (async () => {
      const roll = new TeriockRoll(rollFormula, { speaker: chatData.speaker });
      await roll.toMessage({
        user: chatData.user,
        speaker: chatData.speaker,
        flavor: `Revitalize Roll`,
      });
      const total = roll.total;
      for (const actor of actors) {
        await actor.revitalize(total);
      }
    })().catch(console.error);
    return false;
  }
});


Hooks.on('renderChatMessageHTML', (message, html, context) => {
  const images = html.querySelectorAll('.timage');
  const imageContextMenuOptions = [
    {
      name: 'Open Image',
      icon: '<i class="fa-solid fa-image"></i>',
      callback: async (target) => {
        const img = target.getAttribute('data-src');
        const image = new TeriockImage(img);
        image.render(true);
      },
      condition: (target) => {
        const img = target.getAttribute('data-src');
        return img && img.length > 0;
      }
    }
  ]
  new ux.ContextMenu(html, '.timage', imageContextMenuOptions, {
    eventName: 'contextmenu',
    jQuery: false,
    fixed: true,
  });
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

// Hooks.on('applyTokenStatusEffect', async (token, statusId, active) => {
//   // TODO: Fix bug where this hook only fires for the 'dead' condition
//   const actor = token.actor;
//   if (statusId === 'dead' && active) {
//     actor.toggleStatusEffect('down', { active: true });
//   }
// });


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