/** @import TeriockAbilityData from "../ability-data.mjs"; */
/** @import TeriockRoll from "../../../../documents/roll.mjs"; */
/** @import { AbilityRollOptions } from "../../../../types/rolls"; */
const { api, ux } = foundry.applications
import { generateEffect } from "./_generate-effect.mjs";
import TeriockRoll from "../../../../documents/roll.mjs";
import { evaluateAsync } from "../../../../helpers/utils.mjs";

/**
 * @param {TeriockAbilityData} abilityData
 * @param {AbilityRollOptions} options
 * @returns {Promise<void>}
 */
export async function _roll(abilityData, options) {
  const advantage = options?.advantage || false;
  const disadvantage = options?.disadvantage || false;
  await stageUse(abilityData, advantage, disadvantage);
  await use(abilityData);
  if (abilityData.duration && abilityData.duration !== 'Instant' && abilityData.maneuver !== 'passive') {
    if (abilityData.targets.includes('self') || abilityData.delivery.base === 'self') {
      await generateEffect(abilityData, abilityData.parent.getActor());
    }
    if (abilityData.targets.includes('creature')) {
      const targets = game.user.targets;
      for (const target of targets) {
        console.log(target, target.actor);
        await generateEffect(abilityData, target.actor);
      }
    }
  }
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {TeriockRoll} roll
 * @returns {Promise<string>}
 */
async function attackMessage(abilityData, roll) {
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

/**
 * @param {TeriockAbilityData} abilityData
 * @param {boolean} advantage
 * @param {boolean} disadvantage
 * @returns {Promise<void>}
 */
async function stageUse(abilityData, advantage, disadvantage) {
  abilityData.live = {
    costs: {},
    modifiers: {},
    consequences: {},
    formula: "",
  };
  abilityData.live.costs.mp = 0;
  abilityData.live.costs.hp = 0;
  abilityData.live.modifiers.heightened = 0;
  if (abilityData.costs.mp.type == 'static') {
    abilityData.live.costs.mp = abilityData.costs.mp.value.static;
  } else if (abilityData.costs.mp.type === 'formula') {
    abilityData.live.costs.mp = await evaluateAsync(abilityData.costs.mp.value.formula, abilityData.parent.getActor().getRollData());
  }
  if (abilityData.costs.hp.type == 'static') {
    abilityData.live.costs.hp = abilityData.costs.hp.value.static;
  } else if (abilityData.costs.hp.type === 'formula') {
    abilityData.live.costs.hp = await evaluateAsync(abilityData.costs.hp.value.formula, abilityData.parent.getActor().getRollData());
  }
  let rollFormula = '';
  if (abilityData.interaction == 'attack') {
    rollFormula += '1d20'
    if (advantage) {
      rollFormula = '2d20kh1';
    } else if (disadvantage) {
      rollFormula = '2d20kl1';
    }
    rollFormula += ' + @atkPen + @av0';
    if (abilityData.delivery.base == 'weapon') {
      rollFormula += ' + @sb';
    }
  } else if (abilityData.interaction == 'feat') {
    rollFormula = '10';
  } else {
    rollFormula = '0';
  }
  if (abilityData.effects.includes('resistance')) {
    rollFormula = '1d20';
    if (advantage) {
      rollFormula = '2d20kh1';
    } else if (disadvantage) {
      rollFormula = '2d20kl1';
    }
  }
  const dialogs = [];
  if (abilityData.costs.mp.type === 'variable') {
    let mpDialog = `<fieldset><legend>Variable Mana Cost</legend>`
    const variableMpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.mp.value.variable);
    mpDialog += `<div>${variableMpDescription}</div>`;
    mpDialog += `<input type="number" name="mp" value="0" min="0" max="${abilityData.parent.getActor().system.mp.value - abilityData.parent.getActor().system.mp.min}" step="1"></input></fieldset>`;
    dialogs.push(mpDialog);
  }
  if (abilityData.costs.hp.type === 'variable') {
    let hpDialog = `<fieldset><legend>Variable Hit Point Cost</legend>`;
    const variableHpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.hp.value.variable);
    hpDialog += `<div>${variableHpDescription}</div>`;
    hpDialog += `<input type="number" name="hp" value="0" min="0" max="${abilityData.parent.getActor().system.hp.value - abilityData.parent.getActor().system.hp.min}" step="1"></input></fieldset>`;
    dialogs.push(hpDialog);
  }
  if (abilityData.isProficient && abilityData.heightened) {
    const p = abilityData.isProficient ? abilityData.parent.getActor().system.p : 0;
    let heightenedDialog = '<fieldset><legend>Heightened Amount</legend>';
    const heightenedDescription = await ux.TextEditor.enrichHTML(abilityData.heightened);
    heightenedDialog += `<div>${heightenedDescription}</div>`;
    heightenedDialog += `<input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input></fieldset>`;
    dialogs.push(heightenedDialog);
  }
  if (dialogs.length > 0) {
    let title = '';
    if (abilityData.spell) {
      title += 'Casting ';
    } else {
      title += 'Executing ';
    }
    title += abilityData.parent.name;
    await api.DialogV2.prompt({
      window: { title: title },
      content: dialogs.join(''),
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          if (abilityData.costs.mp.type == 'variable') {
            abilityData.live.costs.mp = button.form.elements.mp.valueAsNumber;
          }
          if (abilityData.costs.hp.type == 'variable') {
            abilityData.live.costs.hp = button.form.elements.hp.valueAsNumber;
          }
          if (abilityData.isProficient && abilityData.heightened) {
            abilityData.live.modifiers.heightened = button.form.elements.heightened.valueAsNumber;
            abilityData.live.costs.mp += abilityData.live.modifiers.heightened;
          }
        }
      },
    });
  }
  if (['attack', 'feat'].includes(abilityData.interaction) || abilityData.effects.includes('resistance')) {
    if (abilityData.isFluent) {
      rollFormula += ' + @f';
    } else if (abilityData.isProficient) {
      rollFormula += ' + @p';
    }
    if (abilityData.live.modifiers.heightened > 0) {
      rollFormula += ' + @h';
    }
  }
  abilityData.live.formula = rollFormula;
}

/**
 * @param {TeriockAbilityData} abilityData 
 * @returns {Promise<TeriockRoll>}
 */
async function use(abilityData) {
  let message = await abilityData.parent.buildMessage();
  const getRollData = abilityData.parent.getActor().getRollData();
  getRollData.av0 = 0;
  getRollData.h = abilityData.live.modifiers.heightened || 0;
  let properties;
  let diceClass;
  let diceTooltip;
  if (abilityData.delivery.base == 'weapon') {
    properties = abilityData.parent.getActor().system.primaryAttacker?.effectKeys?.property || new Set();
    if (properties.has('av0') || abilityData.parent.getActor()?.system.piercing == 'av0') {
      getRollData.av0 = 2;
    }
    if (properties.has('ub') || abilityData.parent.getActor()?.system.piercing == 'ub') {
      diceClass = 'ub';
      diceTooltip = 'Unblockable';
      getRollData.av0 = 2;
    }
  }
  if (abilityData.piercing == 'av0') {
    getRollData.av0 = 2;
  }
  if (abilityData.piercing == 'ub') {
    diceClass = 'ub';
    diceTooltip = 'Unblockable';
    getRollData.av0 = 2;
  }
  const context = {
    diceClass: diceClass,
    diceTooltip: diceTooltip,
  }
  if (abilityData.effects.includes('resistance')) {
    context.diceClass = 'resist';
    context.diceTooltip = '';
    context.isResistance = true;
    context.threshold = 10;
  }
  if (abilityData.elderSorcery) {
    context.elderSorceryElements = abilityData.elements;
    context.elderSorceryIncant = abilityData.elderSorceryIncant;
    context.isElderSorcery = true;
  }
  message = await foundry.applications.ux.TextEditor.enrichHTML(message);
  let roll;
  roll = new TeriockRoll(abilityData.live.formula, getRollData, {
    message: message,
    context: context,
  });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: abilityData.parent.getActor(),
    }),
  });
  let newPenalty = abilityData.parent.getActor().system.attackPenalty;
  if (abilityData.interaction == 'attack') {
    newPenalty -= 3;
  }
  abilityData.parent.getActor().update({
    'system.mp.value': abilityData.parent.getActor().system.mp.value - abilityData.live.costs.mp,
    'system.hp.value': abilityData.parent.getActor().system.hp.value - abilityData.live.costs.hp,
    'system.attackPenalty': newPenalty,
  })
  abilityData.mpCost = 0;
  abilityData.hpCost = 0;
  abilityData.heightenedAmount = 0;
  abilityData.formula = null;
  return roll;
}