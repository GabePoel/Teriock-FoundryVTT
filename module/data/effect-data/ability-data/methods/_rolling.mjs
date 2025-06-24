/** @import { CommonRollOptions } from "../../../../types/rolls"; */
/** @import TeriockAbilityData from "../ability-data.mjs"; */
const { api, ux } = foundry.applications;
import { _generateEffect } from "./_generate-effect.mjs";
import { evaluateAsync } from "../../../../helpers/utils.mjs";
import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * @param {TeriockAbilityData} abilityData
 * @param {CommonRollOptions} options
 * @returns {Promise<void>}
 * @private
 */
export async function _roll(abilityData, options) {
  const advantage = options?.advantage || false;
  const disadvantage = options?.disadvantage || false;
  const useData = await stageUse(abilityData, advantage, disadvantage);
  await use(abilityData, useData);
  if (abilityData.duration && abilityData.duration !== "Instant" && abilityData.maneuver !== "passive") {
    if (abilityData.targets.includes("self") || abilityData.delivery.base === "self") {
      await _generateEffect(abilityData, abilityData.parent.getActor());
    }
    if (abilityData.targets.includes("creature")) {
      const targets = game.user.targets;
      for (const target of targets) {
        await _generateEffect(abilityData, target.actor);
      }
    }
  }
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {boolean} advantage
 * @param {boolean} disadvantage
 * @returns {Promise<object>}
 */
async function stageUse(abilityData, advantage, disadvantage) {
  const useData = {
    costs: {},
    modifiers: {},
    consequences: {},
    formula: "",
    rollData: abilityData.parent.getActor().getRollData(),
  };
  useData.costs.mp = 0;
  useData.costs.hp = 0;
  useData.modifiers.heightened = 0;
  if (abilityData.costs.mp.type == "static") {
    useData.costs.mp = abilityData.costs.mp.value.static;
  } else if (abilityData.costs.mp.type === "formula") {
    useData.costs.mp = await evaluateAsync(abilityData.costs.mp.value.formula, useData.rollData);
  }
  if (abilityData.costs.hp.type == "static") {
    useData.costs.hp = abilityData.costs.hp.value.static;
  } else if (abilityData.costs.hp.type === "formula") {
    useData.costs.hp = await evaluateAsync(abilityData.costs.hp.value.formula, useData.rollData);
  }
  let rollFormula = "";
  if (abilityData.interaction == "attack") {
    rollFormula += "1d20";
    if (advantage) {
      rollFormula = "2d20kh1";
    } else if (disadvantage) {
      rollFormula = "2d20kl1";
    }
    rollFormula += " + @atkPen + @av0";
    if (abilityData.delivery.base == "weapon") {
      rollFormula += " + @sb";
    }
  } else if (abilityData.interaction == "feat") {
    rollFormula = "10";
  } else {
    rollFormula = "0";
  }
  if (abilityData.effects.includes("resistance")) {
    rollFormula = "1d20";
    if (advantage) {
      rollFormula = "2d20kh1";
    } else if (disadvantage) {
      rollFormula = "2d20kl1";
    }
  }
  const dialogs = [];
  if (abilityData.costs.mp.type === "variable") {
    let mpDialog = "<fieldset><legend>Variable Mana Cost</legend>";
    const variableMpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.mp.value.variable);
    mpDialog += `<div>${variableMpDescription}</div>`;
    mpDialog += `
      <input
        type="number"
        name="mp"
        value="0"
        min="0"
        max="${abilityData.parent.getActor().system.mp.value - abilityData.parent.getActor().system.mp.min}"
        step="1"
      ></input></fieldset>`;
    dialogs.push(mpDialog);
  }
  if (abilityData.costs.hp.type === "variable") {
    let hpDialog = "<fieldset><legend>Variable Hit Point Cost</legend>";
    const variableHpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.hp.value.variable);
    hpDialog += `<div>${variableHpDescription}</div>`;
    hpDialog += `
      <input
        type="number"
        name="hp"
        value="0"
        min="0"
        max="${abilityData.parent.getActor().system.hp.value - abilityData.parent.getActor().system.hp.min}"
        step="1"
      ></input></fieldset>`;
    dialogs.push(hpDialog);
  }
  if (abilityData.isProficient && abilityData.heightened) {
    const p = abilityData.isProficient ? abilityData.parent.getActor().system.p : 0;
    let heightenedDialog = "<fieldset><legend>Heightened Amount</legend>";
    const heightenedDescription = await ux.TextEditor.enrichHTML(abilityData.heightened);
    heightenedDialog += `<div>${heightenedDescription}</div>`;
    heightenedDialog += `
      <input
        type="number"
        name="heightened"
        value="0"
        min="0"
        max="${p}"
        step="1"
      ></input></fieldset>`;
    dialogs.push(heightenedDialog);
  }
  if (dialogs.length > 0) {
    let title = "";
    if (abilityData.spell) {
      title += "Casting ";
    } else {
      title += "Executing ";
    }
    title += abilityData.parent.name;
    await api.DialogV2.prompt({
      window: { title: title },
      content: dialogs.join(""),
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          if (abilityData.costs.mp.type == "variable") {
            useData.costs.mp = button.form.elements.mp.valueAsNumber;
          }
          if (abilityData.costs.hp.type == "variable") {
            useData.costs.hp = button.form.elements.hp.valueAsNumber;
          }
          if (abilityData.isProficient && abilityData.heightened) {
            useData.modifiers.heightened = button.form.elements.heightened.valueAsNumber;
            useData.costs.mp += useData.modifiers.heightened;
          }
        },
      },
    });
  }
  if (["attack", "feat"].includes(abilityData.interaction) || abilityData.effects.includes("resistance")) {
    if (abilityData.isFluent) {
      rollFormula += " + @f";
    } else if (abilityData.isProficient) {
      rollFormula += " + @p";
    }
    if (useData.modifiers.heightened > 0) {
      rollFormula += " + @h";
    }
  }
  useData.formula = rollFormula;
  return useData;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {object} useData
 * @returns {Promise<TeriockRoll>}
 */
async function use(abilityData, useData) {
  let message = await abilityData.parent.buildMessage();
  const rollData = useData.rollData;
  rollData.av0 = 0;
  rollData.h = useData.modifiers.heightened || 0;
  let properties;
  let diceClass;
  let diceTooltip;
  if (abilityData.delivery.base == "weapon") {
    properties = abilityData.parent.getActor().system.primaryAttacker?.effectKeys?.property || new Set();
    if (properties.has("av0") || abilityData.parent.getActor()?.system.piercing == "av0") {
      rollData.av0 = 2;
    }
    if (properties.has("ub") || abilityData.parent.getActor()?.system.piercing == "ub") {
      diceClass = "ub";
      diceTooltip = "Unblockable";
      rollData.av0 = 2;
    }
  }
  if (abilityData.piercing == "av0") {
    rollData.av0 = 2;
  }
  if (abilityData.piercing == "ub") {
    diceClass = "ub";
    diceTooltip = "Unblockable";
    rollData.av0 = 2;
  }
  const context = {
    diceClass: diceClass,
    diceTooltip: diceTooltip,
  };
  if (abilityData.effects.includes("resistance")) {
    context.diceClass = "resist";
    context.diceTooltip = "";
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
  roll = new TeriockRoll(useData.formula, rollData, {
    message: message,
    context: context,
  });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: abilityData.parent.getActor(),
    }),
  });
  let newPenalty = abilityData.parent.getActor().system.attackPenalty;
  if (abilityData.interaction == "attack") {
    newPenalty -= 3;
  }
  await abilityData.parent.getActor().update({
    "system.mp.value": abilityData.parent.getActor().system.mp.value - useData.costs.mp,
    "system.hp.value": abilityData.parent.getActor().system.hp.value - useData.costs.hp,
    "system.attackPenalty": newPenalty,
  });
  return roll;
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
  let message = "";
  if (targetsHit.length > 0) {
    message += "<p><b>Targets hit</b></p>";
    message += "<ul>";
    for (const target of targetsHit) {
      message += `<li>${target.name}</li>`;
    }
    message += "</ul>";
  }
  if (targetsMissed.length > 0) {
    message += "<p><b>Targets missed</b></p>";
    message += "<ul>";
    for (const target of targetsMissed) {
      message += `<li>${target.name}</li>`;
    }
    message += "</ul>";
  }
  return message;
}
