const { DialogV2 } = foundry.applications.api
import generateEffect from "../ability/generate-effect.mjs";
import TeriockRoll from "../../documents/roll.mjs";

export async function rollAbility(ability, options) {
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
  ability.system.mpCost = 0;
  ability.system.hpCost = 0;
  ability.system.heightenedAmount = 0;
  if (ability.system.costs.mp && typeof ability.system.costs.mp === "number") {
    ability.system.mpCost = ability.system.costs.mp;
  }
  if (ability.system.costs.hp && typeof ability.system.costs.hp === "number") {
    ability.system.hpCost = ability.system.costs.hp;
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
  if (ability.system.costs.mp == 'x') {
    const mpDialog = `<label>MP Cost</label><input type="number" name="mp" value="0" min="0" max="${ability.getActor().mp}" step="1"></input>`;
    dialogs.push(mpDialog);
  }
  if (ability.system.costs.hp == 'x') {
    const hpDialog = `<label>HP Cost</label><input type="number" name="hp" value="0" min="0" max="${ability.getActor().hp}" step="1"></input>`;
    dialogs.push(hpDialog);
  }
  if (ability.system.isProficient && ability.system.heightened) {
    const p = ability.system.isProficient ? ability.getActor().system.p : 0;
    const heightenedDialog = `<label>Heightened Amount</label><input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input>`;
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
    await DialogV2.prompt({
      window: { title: title },
      content: dialogs.join(''),
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          if (ability.system.costs.mp == 'x') {
            ability.system.mpCost = button.form.elements.mp.valueAsNumber;
          }
          if (ability.system.costs.hp == 'x') {
            ability.system.hpCost = button.form.elements.hp.valueAsNumber;
          }
          if (ability.system.isProficient && ability.system.heightened) {
            ability.system.heightenedAmount = button.form.elements.heightened.valueAsNumber;
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
    if (ability.system.heightenedAmount) {
      rollFormula += ' + @h';
    }
  }
  ability.system.formula = rollFormula;
}

async function use(ability) {
  let message = await ability.buildMessage();
  const getRollData = ability.getActor().getRollData();
  getRollData.av0 = 0;
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
  roll = new TeriockRoll(ability.system.formula, getRollData, {
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
    'system.mp.value': ability.getActor().system.mp.value - ability.system.mpCost - ability.system.heightenedAmount,
    'system.hp.value': ability.getActor().system.hp.value - ability.system.hpCost,
    'system.attackPenalty': newPenalty,
  })
  ability.system.mpCost = 0;
  ability.system.hpCost = 0;
  ability.system.heightenedAmount = 0;
  ability.system.formula = null;
  return roll;
}