/** @import { CommonRollOptions } from "../../../../types/rolls"; */
/** @import TeriockAbilityData from "../ability-data.mjs"; */
const { api, ux } = foundry.applications;
import { _generateEffect, _generateTakes } from "./_generate-effect.mjs";
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
  const rawMessage = await abilityData.parent.buildMessage();
  const message = `<div class="teriock">${rawMessage}</div>`;
  const chatMessageData = {
    speaker: ChatMessage.getSpeaker({ actor: abilityData.parent.getActor() }),
    rolls: [],
  };
  const useData = await stageUse(abilityData, advantage, disadvantage);

  const buttons = [];

  const effectData = await _generateEffect(abilityData, abilityData.parent.getActor(), useData.modifiers.heightened);

  if (abilityData.interaction === "feat") {
    // Add a button to roll the feat save for each target
    const featSaveAttr = abilityData.featSaveAttribute?.toUpperCase?.() || "SAVE";
    buttons.push({
      label: `Roll ${featSaveAttr} Save`,
      icon: "fas fa-dice-d20",
      action: "rollFeatSave",
      data: abilityData.featSaveAttribute,
    });
  }

  if (effectData) {
    buttons.push({
      label: "Apply Effect",
      icon: "fas fa-plus",
      action: "applyEffect",
      data: JSON.stringify(effectData),
    });
  }

  if (abilityData.effects && abilityData.effects.includes("resistance")) {
    buttons.push({
      label: "Roll Resistance",
      icon: "fas fa-shield-alt",
      action: "rollResistance",
      data: "resistance",
    });
  }

  const takeData = await _generateTakes(abilityData, useData.modifiers.heightened);

  if (takeData.rolls.damage) {
    buttons.push({
      label: "Roll Damage",
      icon: "fas fa-heart",
      action: "takeDamage",
      data: takeData.rolls.damage,
    });
  }

  if (takeData.rolls.drain) {
    buttons.push({
      label: "Roll Drain",
      icon: "fas fa-brain",
      action: "takeDrain",
      data: takeData.rolls.drain,
    });
  }

  if (takeData.rolls.wither) {
    buttons.push({
      label: "Roll Wither",
      icon: "fas fa-hourglass-half",
      action: "takeWither",
      data: takeData.rolls.wither,
    });
  }

  if (takeData.rolls.heal) {
    buttons.push({
      label: "Roll Heal",
      icon: "fas fa-heart",
      action: "takeHeal",
      data: takeData.rolls.heal,
    });
  }

  if (takeData.rolls.revitalize) {
    buttons.push({
      label: "Roll Revitalize",
      icon: "fas fa-heart",
      action: "takeRevitalize",
      data: takeData.rolls.revitalize,
    });
  }

  if (takeData.rolls.setTempHp) {
    buttons.push({
      label: "Roll Temp HP",
      icon: "fas fa-heart",
      action: "takeSetTempHp",
      data: takeData.rolls.setTempHp,
    });
  }

  if (takeData.rolls.setTempMp) {
    buttons.push({
      label: "Roll Temp MP",
      icon: "fas fa-brain",
      action: "takeSetTempMp",
      data: takeData.rolls.setTempMp,
    });
  }

  if (takeData.rolls.gainTempHp) {
    buttons.push({
      label: "Roll Temp HP",
      icon: "fas fa-heart",
      action: "takeGainTempHp",
      data: takeData.rolls.gainTempHp,
    });
  }

  if (takeData.rolls.gainTempMp) {
    buttons.push({
      label: "Roll Temp MP",
      icon: "fas fa-brain",
      action: "takeGainTempMp",
      data: takeData.rolls.gainTempMp,
    });
  }

  if (takeData.rolls.sleep) {
    buttons.push({
      label: "Roll Sleep",
      icon: "fas fa-bed",
      action: "takeSleep",
      data: takeData.rolls.sleep,
    });
  }

  if (takeData.rolls.kill) {
    buttons.push({
      label: "Roll Kill",
      icon: "fas fa-skull",
      action: "takeKill",
      data: takeData.rolls.kill,
    });
  }

  // Determine targets, handling 'self' logic
  let targets = Array.from(game.user.targets);
  const targetsSelf = abilityData.targets?.length === 1 && abilityData.targets[0] === "self";
  const includesSelf = abilityData.targets?.includes("self");
  if (targetsSelf || (includesSelf && targets.length === 0)) {
    // Use the actor as the target
    const actor = abilityData.parent.getActor();
    let token = null;
    if (typeof actor.getActiveTokens === "function") {
      const tokens = actor.getActiveTokens();
      if (tokens && tokens.length > 0) {
        token = tokens[0];
      }
    }
    // Create a pseudo-target object compatible with the rest of the code
    targets = [
      {
        name: token ? token.name : actor.name,
        actor: actor,
        img: token ? token.texture?.src || token.img : actor.img,
        uuid: token ? token.document?.uuid : actor.uuid,
      },
    ];
  }

  if (abilityData.interaction === "attack") {
    if (targets.length === 0) {
      const attackRoll = await _generateAttackRoll(abilityData, useData, options, null, message, buttons);
      chatMessageData.rolls.push(attackRoll);
    } else {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const isLastRoll = i === targets.length - 1;
        const attackRoll = await _generateAttackRoll(
          abilityData,
          useData,
          options,
          target,
          i === 0 ? message : null,
          isLastRoll ? buttons : [],
        );
        chatMessageData.rolls.push(attackRoll);
      }
    }
    const actor = abilityData.parent.getActor();
    const attackPenalty = actor.system.attackPenalty;
    await actor.update({ "system.attackPenalty": attackPenalty - 3 });
  }

  if (abilityData.interaction === "feat") {
    if (targets.length === 0) {
      const featRoll = await _generateFeatRoll(abilityData, useData, options, null, message, buttons, false);
      chatMessageData.rolls.push(featRoll);
    } else {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const isLastRoll = i === targets.length - 1;
        const featRoll = await _generateFeatRoll(
          abilityData,
          useData,
          options,
          target,
          i === 0 ? message : null,
          isLastRoll ? buttons : [],
          isLastRoll ? false : true,
        );
        chatMessageData.rolls.push(featRoll);
      }
    }
  }

  if (abilityData.interaction === "manifest" || abilityData.interaction === "block") {
    if (targets.length === 0) {
      const roll = await _generateFeatRoll(abilityData, useData, options, null, message, buttons, true);
      chatMessageData.rolls.push(roll);
    } else {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const isLastRoll = i === targets.length - 1;
        const roll = await _generateFeatRoll(
          abilityData,
          useData,
          options,
          target,
          i === 0 ? message : null,
          isLastRoll ? buttons : [],
          true,
        );
        chatMessageData.rolls.push(roll);
      }
    }
  }

  for (const roll of chatMessageData.rolls) {
    await roll.evaluate();
  }
  console.log(chatMessageData);
  const chatMessage = await foundry.documents.ChatMessage.create(chatMessageData);
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
  if (["attack", "feat"].includes(abilityData.interaction)) {
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
 * @param {CommonRollOptions} options
 * @returns {Promise<TeriockRoll>}
 * @private
 */
export async function _generateAttackRoll(
  abilityData,
  useData,
  options = {},
  target = null,
  message = null,
  buttons = [],
) {
  const advantage = options?.advantage || false;
  const disadvantage = options?.disadvantage || false;

  // Build the roll formula
  let rollFormula = "";
  if (abilityData.interaction === "attack") {
    rollFormula += "1d20";
    if (advantage) {
      rollFormula = "2d20kh1";
    } else if (disadvantage) {
      rollFormula = "2d20kl1";
    }
    rollFormula += " + @atkPen + @av0";
    if (abilityData.delivery.base === "weapon") {
      rollFormula += " + @sb";
    }
  } else if (abilityData.interaction === "feat") {
    rollFormula = "10";
  } else {
    rollFormula = "0";
  }

  // Add proficiency and fluency modifiers
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

  // Handle resistance rolls
  if (abilityData.effects.includes("resistance")) {
    rollFormula = "1d20";
    if (advantage) {
      rollFormula = "2d20kh1";
    } else if (disadvantage) {
      rollFormula = "2d20kl1";
    }
  }

  // Prepare roll data
  const rollData = useData.rollData;
  rollData.av0 = 0;
  rollData.h = useData.modifiers.heightened || 0;

  // Handle piercing and properties
  let properties;
  let diceClass;
  let diceTooltip;
  let unblockable = false;

  if (abilityData.delivery.base === "weapon") {
    properties = abilityData.parent.getActor().system.primaryAttacker?.effectKeys?.property || new Set();
    if (properties.has("av0") || abilityData.parent.getActor()?.system.piercing === "av0") {
      rollData.av0 = 2;
    }
    if (properties.has("ub") || abilityData.parent.getActor()?.system.piercing === "ub") {
      diceClass = "ub";
      diceTooltip = "Unblockable";
      rollData.av0 = 2;
      unblockable = true;
    }
  }

  if (abilityData.piercing === "av0") {
    rollData.av0 = 2;
  }
  if (abilityData.piercing === "ub") {
    diceClass = "ub";
    diceTooltip = "Unblockable";
    rollData.av0 = 2;
    unblockable = true;
  }

  // Build context
  const context = {
    diceClass: diceClass,
    diceTooltip: diceTooltip,
    buttons: buttons,
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

  if (target) {
    context.targetName = target.name;
    context.targetImg = target.actor.img;
    context.threshold = target.actor.system.cc;
    context.targetUuid = target.actor.uuid;
    if (unblockable) {
      context.threshold = target.actor.system.ac;
    }
  }

  // Create and return the roll
  const roll = new TeriockRoll(rollFormula, rollData, {
    context: context,
    message: message,
  });

  return roll;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {object} useData
 * @param {CommonRollOptions} options
 * @param {object|null} target
 * @param {string|null} message
 * @param {Array} buttons
 * @param {boolean} noDice
 * @returns {Promise<TeriockRoll>}
 * @private
 */
export async function _generateFeatRoll(
  abilityData,
  useData,
  options = {},
  target = null,
  message = null,
  buttons = [],
  noDice = false,
) {
  // Build the roll formula
  let rollFormula = "10";
  // Add proficiency and fluency modifiers
  if (abilityData.isFluent) {
    rollFormula += " + @f";
  } else if (abilityData.isProficient) {
    rollFormula += " + @p";
  }
  if (useData.modifiers.heightened > 0) {
    rollFormula += " + @h";
  }

  // Prepare roll data
  const rollData = useData.rollData;
  rollData.h = useData.modifiers.heightened || 0;

  // Build context
  const context = {
    buttons: buttons,
    diceClass: "feat",
    totalClass: "feat",
  };

  if (abilityData.elderSorcery) {
    context.elderSorceryElements = abilityData.elements;
    context.elderSorceryIncant = abilityData.elderSorceryIncant;
    context.isElderSorcery = true;
  }

  if (target) {
    context.targetName = target.name;
    context.targetImg = target.actor.img;
    context.targetUuid = target.actor.uuid;
  }

  if (noDice) {
    context.noDice = true;
  }

  // Create and return the roll
  const roll = new TeriockRoll(rollFormula, rollData, {
    context: context,
    message: message,
  });

  return roll;
}
