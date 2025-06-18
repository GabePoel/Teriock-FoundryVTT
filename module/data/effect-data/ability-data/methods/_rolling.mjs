const { api, ux } = foundry.applications
import generateEffect from "./_generate-effect.mjs";
import TeriockRoll from "../../../../documents/roll.mjs";
import { evaluateAsync } from "../../../../helpers/utils.mjs";

export async function _roll(ability, options) {
  const advantage = options?.advantage || false;
  const disadvantage = options?.disadvantage || false;
  await stageUse(ability, advantage, disadvantage);
  await use(ability);
  if (ability.system.duration && ability.system.duration !== 'Instant' && ability.system.maneuver !== 'passive') {
    if (ability.system.targets.includes('self') || ability.system.delivery.base === 'self') {
      await generateEffect(ability, ability.getActor());
    }
    if (ability.system.targets.includes('creature')) {
      const targets = game.user.targets;
      for (const target of targets) {
        console.log(target, target.actor);
        await generateEffect(ability, target.actor);
      }
    }
  }
}

async function attackMessage(ability, roll) {
  const targets = game.user.targets;
  let targetsHit = [];
  let targetsMissed = [];
  for (const target of targets) {
    const targetActor = target.actor;
    const ac = targetActor.system.ac;
    const rollResult = roll.total;
    const hit = rollResult >= ac;
    if (hit) {
      targetsHit.push(targetActor);
    } else {
      targetsMissed.push(targetActor);
    }
  }
  let message = '';
  if (targetsHit.length > 0) {
    message += `<p><b>Targets hit</b></p>`;
    message += `<ul>`;
    for (const target of targetsHit) {
      message += `<li>${target.name}</li>`;
    }
    message += `</ul>`;
  }
  if (targetsMissed.length > 0) {
    message += `<p><b>Targets missed</b></p>`;
    message += `<ul>`;
    for (const target of targetsMissed) {
      message += `<li>${target.name}</li>`;
    }
    message += `</ul>`;
  }
  return message;
}

async function stageUse(ability, advantage, disadvantage) {
  ability.live = {
    costs: {},
    modifiers: {},
    consequences: {},
    formula: "",
  };
  ability.live.costs.mp = 0;
  ability.live.costs.hp = 0;
  ability.live.modifiers.heightened = 0;
  if (ability.system.costs.mp.type == 'static') {
    ability.live.costs.mp = ability.system.costs.mp.value.static;
  } else if (ability.system.costs.mp.type === 'formula') {
    ability.live.costs.mp = await evaluateAsync(ability.system.costs.mp.value.formula, ability.getActor().getRollData());
  }
  if (ability.system.costs.hp.type == 'static') {
    ability.live.costs.hp = ability.system.costs.hp.value.static;
  } else if (ability.system.costs.hp.type === 'formula') {
    ability.live.costs.hp = await evaluateAsync(ability.system.costs.hp.value.formula, ability.getActor().getRollData());
  }
  let rollFormula = '';
  if (ability.system.interaction == 'attack') {
    rollFormula += '1d20'
    if (advantage) {
      rollFormula = '2d20kh1';
    } else if (disadvantage) {
      rollFormula = '2d20kl1';
    }
    rollFormula += ' + @atkPen + @av0';
    if (ability.system.delivery.base == 'weapon') {
      rollFormula += ' + @sb';
    }
  } else if (ability.system.interaction == 'feat') {
    rollFormula = '10';
  } else {
    rollFormula = '0';
  }
  if (ability.system.effects.includes('resistance')) {
    rollFormula = '1d20';
    if (advantage) {
      rollFormula = '2d20kh1';
    } else if (disadvantage) {
      rollFormula = '2d20kl1';
    }
  }
  const dialogs = [];
  if (ability.system.costs.mp.type === 'variable') {
    let mpDialog = `<fieldset><legend>Variable Mana Cost</legend>`
    const variableMpDescription = await ux.TextEditor.enrichHTML(ability.system.costs.mp.value.variable);
    mpDialog += `<div>${variableMpDescription}</div>`;
    mpDialog += `<input type="number" name="mp" value="0" min="0" max="${ability.getActor().system.mp.value - ability.getActor().system.mp.min}" step="1"></input></fieldset>`;
    dialogs.push(mpDialog);
  }
  if (ability.system.costs.hp.type === 'variable') {
    let hpDialog = `<fieldset><legend>Variable Hit Point Cost</legend>`;
    const variableHpDescription = await ux.TextEditor.enrichHTML(ability.system.costs.hp.value.variable);
    hpDialog += `<div>${variableHpDescription}</div>`;
    hpDialog += `<input type="number" name="hp" value="0" min="0" max="${ability.getActor().system.hp.value - ability.getActor().system.hp.min}" step="1"></input></fieldset>`;
    dialogs.push(hpDialog);
  }
  if (ability.system.isProficient && ability.system.heightened) {
    const p = ability.system.isProficient ? ability.getActor().system.p : 0;
    let heightenedDialog = '<fieldset><legend>Heightened Amount</legend>';
    const heightenedDescription = await ux.TextEditor.enrichHTML(ability.system.heightened);
    heightenedDialog += `<div>${heightenedDescription}</div>`;
    heightenedDialog += `<input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input></fieldset>`;
    dialogs.push(heightenedDialog);
  }
  if (dialogs.length > 0) {
    let title = '';
    if (ability.system.spell) {
      title += 'Casting ';
    } else {
      title += 'Executing ';
    }
    title += ability.name;
    await api.DialogV2.prompt({
      window: { title: title },
      content: dialogs.join(''),
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          if (ability.system.costs.mp.type == 'variable') {
            ability.live.costs.mp = button.form.elements.mp.valueAsNumber;
          }
          if (ability.system.costs.hp.type == 'variable') {
            ability.live.costs.hp = button.form.elements.hp.valueAsNumber;
          }
          if (ability.system.isProficient && ability.system.heightened) {
            ability.live.modifiers.heightened = button.form.elements.heightened.valueAsNumber;
            ability.live.costs.mp += ability.live.modifiers.heightened;
          }
        }
      },
    });
  }
  if (['attack', 'feat'].includes(ability.system.interaction) || ability.system.effects.includes('resistance')) {
    if (ability.system.isFluent) {
      rollFormula += ' + @f';
    } else if (ability.system.isProficient) {
      rollFormula += ' + @p';
    }
    if (ability.live.modifiers.heightened > 0) {
      rollFormula += ' + @h';
    }
  }
  ability.live.formula = rollFormula;
}

async function use(ability) {
  let message = await ability.buildMessage();
  const getRollData = ability.getActor().getRollData();
  getRollData.av0 = 0;
  getRollData.h = ability.live.modifiers.heightened || 0;
  let properties;
  let diceClass;
  let diceTooltip;
  if (ability.system.delivery.base == 'weapon') {
    properties = ability.getActor().system.primaryAttacker?.effectKeys?.property || new Set();
    if (properties.has('av0') || ability.getActor()?.system.piercing == 'av0') {
      getRollData.av0 = 2;
    }
    if (properties.has('ub') || ability.getActor()?.system.piercing == 'ub') {
      diceClass = 'ub';
      diceTooltip = 'Unblockable';
      getRollData.av0 = 2;
    }
  }
  if (ability.system.piercing == 'av0') {
    getRollData.av0 = 2;
  }
  if (ability.system.piercing == 'ub') {
    diceClass = 'ub';
    diceTooltip = 'Unblockable';
    getRollData.av0 = 2;
  }
  const context = {
    diceClass: diceClass,
    diceTooltip: diceTooltip,
  }
  if (ability.system.effects.includes('resistance')) {
    context.diceClass = 'resist';
    context.diceTooltip = '';
    context.isResistance = true;
    context.threshold = 10;
  }
  if (ability.system.elderSorcery) {
    context.elderSorceryElements = ability.system.elements;
    context.elderSorceryIncant = ability.system.elderSorceryIncant;
    context.isElderSorcery = true;
  }
  message = await foundry.applications.ux.TextEditor.enrichHTML(message);
  let roll;
  roll = new TeriockRoll(ability.live.formula, getRollData, {
    message: message,
    context: context,
  });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: ability.getActor(),
    }),
  });
  let newPenalty = ability.getActor().system.attackPenalty;
  if (ability.system.interaction == 'attack') {
    newPenalty -= 3;
  }
  ability.getActor().update({
    'system.mp.value': ability.getActor().system.mp.value - ability.live.costs.mp,
    'system.hp.value': ability.getActor().system.hp.value - ability.live.costs.hp,
    'system.attackPenalty': newPenalty,
  })
  ability.system.mpCost = 0;
  ability.system.hpCost = 0;
  ability.system.heightenedAmount = 0;
  ability.system.formula = null;
  return roll;
}