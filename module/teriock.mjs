import { TeriockActor } from './documents/actor.mjs';
import { TeriockItem } from './documents/item.mjs';
import { TeriockEffect } from './documents/effect.mjs';
import TeriockTokenDocument from './documents/token.mjs';
import { TeriockCharacterSheet } from './sheets/character-sheet.mjs';
import { TeriockAbilitySheet } from './sheets/ability-sheet.mjs';
import { TeriockResourceSheet } from './sheets/resource-sheet.mjs';
import { TeriockEquipmentSheet } from './sheets/equipment-sheet.mjs';
import { TeriockRankSheet } from './sheets/rank-sheet.mjs';
import { TeriockFluencySheet } from './sheets/fluency-sheet.mjs';
import { TeriockPowerSheet } from './sheets/power-sheet.mjs';
import { TeriockPropertySheet } from './sheets/property-sheet.mjs';
import { TeriockEffectSheet } from './sheets/effect-sheet.mjs';
import { TeriockRoll } from './dice/roll.mjs'
import { TeriockHarmRoll } from './dice/harm.mjs';
import { TeriockElderSorceryRoll } from './dice/elder-sorcery.mjs';
import { TeriockImage } from './helpers/image.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { registerHandlebarsHelpers } from './helpers/register-handlebars.mjs';
import { TERIOCK } from './helpers/config.mjs';
import { conditions } from './content/conditions.mjs'
import { teriockVisionModes } from './perception/vision-modes.mjs';
import { teriockDetectionModes } from './perception/detection-modes.mjs';
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


  // Remove the lightPerception detection mode if it exists
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

  CONFIG.Dice.rolls.push(TeriockRoll);
  CONFIG.Dice.rolls.push(TeriockHarmRoll);
  CONFIG.Dice.rolls.push(TeriockElderSorceryRoll);
  CONFIG.Actor.documentClass = TeriockActor;
  CONFIG.Item.documentClass = TeriockItem;
  CONFIG.ActiveEffect.documentClass = TeriockEffect;
  CONFIG.Token.documentClass = TeriockTokenDocument;

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
  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockPropertySheet, {
    makeDefault: true,
    label: 'Property',
    types: ['property']
  });
  DocumentSheetConfig.registerSheet(TeriockEffect, 'teriock', TeriockEffectSheet, {
    makeDefault: false,
    label: 'Effect',
    types: ['effect']
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
        speaker: DamagechatData.speaker,
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

  if (message.startsWith('/attack')) {
    const chatOptionsRaw = message.split('/attack')[1].trim();
    let advantage = false;
    let disadvantage = false;
    if (chatOptionsRaw.length > 0) {
      const chatOptions = chatOptionsRaw.split(' ');
      advantage = chatOptions.includes('advantage');
      disadvantage = chatOptions.includes('disadvantage');
    }
    const options = {
      advantage: advantage,
      disadvantage: disadvantage,
    }
    for (const actor of actors) {
      actor.useAbility('Basic Attack', options);
    }
    return false;
  }

  if (message.startsWith('/use')) {
    const abilityName = message.split('/use')[1].trim();
    if (!abilityName) {
      ui.notifications.warn('Please specify an ability to use.');
      return false;
    }
    const chatOptionsRaw = message.split('/use')[2]?.trim() || '';
    let advantage = false;
    let disadvantage = false;
    if (chatOptionsRaw.length > 0) {
      const chatOptions = chatOptionsRaw.split(' ');
      advantage = chatOptions.includes('advantage');
      disadvantage = chatOptions.includes('disadvantage');
    }
    const options = {
      advantage: advantage,
      disadvantage: disadvantage,
    }
    for (const actor of actors) {
      actor.useAbility(abilityName, options);
    }
    return false;
  }

  if (message.startsWith('/help')) {
    const helpText = `
      <ul>
        <li>
          <code>/harm [formula]</code>
          <div>Roll an amount of damage, drain, or wither. Makes buttons that anyone can use to apply to targeted tokens.</div>
        </li>
        <li>
          <code>/damage [formula]</code>
          <div>Roll an amount of damage. Automatically applies to targeted tokens.</div>
        </li>
        <li>
          <code>/drain [formula]</code>
          <div>Roll an amount of drain. Automatically applies to targeted tokens.</div>
        </li>
        <li>
          <code>/wither [formula]</code>
          <div>Roll an amount of wither. Automatically applies to targeted tokens.</div>
        </li>
        <li>
          <code>/heal [formula]</code>
          <div>Roll an amount of healing. Automatically applies to targeted tokens.</div>
        </li>
        <li>
          <code>/revitalize [formula]</code>
          <div>Roll an amount of revitalization. Automatically applies to targeted tokens.</div>
        </li>
        <li>
          <code>/attack [options]</code>
          <div>All targeted tokens use the Basic Attack ability.</div>
          <div>Options:</div>
          <ul>
            <li><code>advantage</code> - Roll with advantage.</li>
            <li><code>disadvantage</code> - Roll with disadvantage.</li>
          </ul>
        </li>
        <li>
          <code>/use [ability name] [options]</code>
          <div>All targeted tokens use an ability by name.</div>
          <div>Options:</div>
          <ul>
            <li><code>advantage</code> - Roll with advantage.</li>
            <li><code>disadvantage</code> - Roll with disadvantage.</li>
          </ul>
        </li>
      </ul>
    `;
    ChatMessage.create({
      content: helpText,
      speaker: ChatMessage.getSpeaker({ user: chatData.user }),
      whisper: [chatData.user],
      title: 'Teriock Chat Commands',
      flavor: 'Teriock Chat Commands',
    });
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
  const openTags = html.querySelectorAll('[data-action="open"]');
  openTags.forEach(tag => {
    tag.addEventListener('click', async (event) => {
      event.preventDefault();
      const uuid = tag.getAttribute('data-uuid');
      if (!uuid) return;
      const doc = await fromUuid(uuid);
      if (doc && typeof doc.sheet?.render === 'function') {
        doc.sheet.render(true);
      }
    });
  });
});

// Hooks.on('applyTokenStatusEffect', async (token, statusId, active) => {
//   // TODO: Fix bug where this hook only fires for the 'dead' condition
//   const actor = token.actor;
//   if (statusId === 'dead' && active) {
//     actor.toggleStatusEffect('down', { active: true });
//   }
// });


Hooks.on("hotbarDrop", (bar, data, slot) => {
  fromUuid(data.uuid).then(async item => {
    if (!item || typeof item.roll !== "function") return;
    const id = item._id;

    const macroName = `Roll ${item.name}`;
    const command = `// ID: ${id}
const item = await fromUuid("${item.uuid}");
if (!item) return ui.notifications.warn("Item not found: ${item.name}");

const options = {
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
  twoHanded: window.event?.ctrlKey,
};

await item.roll(options);
`;

    let macroFolder = game.folders.find(f => f.name === "Player Macros" && f.type === "Macro");
    if (!macroFolder) {
      macroFolder = await Folder.create({
        name: "Player Macros",
        type: "Macro",
      });
    }
    let macro = game.macros.find(m => m.name === macroName && m.command?.startsWith(`// ID: ${id}`));
    if (!macro) {
      macro = await Macro.create({
        name: macroName,
        type: "script",
        img: item.img,
        command,
        flags: { "teriock": { itemMacro: true } },
        folder: macroFolder.id,
      }).catch(err => {
        console.error(`Failed to create macro: ${err}`);
        ui.notifications.error(`Failed to create macro: ${err.message}`);
      });
      if (macro) {
        game.user.assignHotbarMacro(macro, slot);
      }
    } else {
      game.user.assignHotbarMacro(macro, slot);
    }
  });

  return false;
});


registerHandlebarsHelpers();