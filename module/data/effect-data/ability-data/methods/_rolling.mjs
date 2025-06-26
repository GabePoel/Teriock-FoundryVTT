/** @import { CommonRollOptions } from "../../../../types/rolls"; */
/** @import TeriockAbilityData from "../ability-data.mjs"; */
const { api, ux } = foundry.applications;
import { _generateEffect, _generateTakes } from "./_generate-effect.mjs";
import { evaluateAsync, getRollIcon } from "../../../../helpers/utils.mjs";
import TeriockRoll from "../../../../documents/roll.mjs";

// Button configurations for different roll types
const BUTTON_CONFIGS = {
  feat: { label: "Roll SAVE Save", icon: "fas fa-dice-d20", action: "rollFeatSave" },
  effect: { label: "Apply Effect", icon: "fas fa-disease", action: "applyEffect" },
  resistance: { label: "Roll Resistance", icon: "fas fa-shield-alt", action: "rollResistance", data: "resistance" },
  tradecraft: { label: "Roll Tradecraft", icon: "fas fa-compass-drafting", action: "rollTradecraft" },
  // Roll buttons
  damage: { label: "Roll Damage", icon: "fas fa-heart", action: "takeDamage" },
  drain: { label: "Roll Drain", icon: "fas fa-brain", action: "takeDrain" },
  wither: { label: "Roll Wither", icon: "fas fa-hourglass-half", action: "takeWither" },
  heal: { label: "Roll Heal", icon: "fas fa-heart", action: "takeHeal" },
  revitalize: { label: "Roll Revitalize", icon: "fas fa-heart", action: "takeRevitalize" },
  setTempHp: { label: "Roll Temp HP", icon: "fas fa-heart", action: "takeSetTempHp" },
  setTempMp: { label: "Roll Temp MP", icon: "fas fa-brain", action: "takeSetTempMp" },
  gainTempHp: { label: "Roll Temp HP", icon: "fas fa-heart", action: "takeGainTempHp" },
  gainTempMp: { label: "Roll Temp MP", icon: "fas fa-brain", action: "takeGainTempMp" },
  sleep: { label: "Roll Sleep", icon: "fas fa-bed", action: "takeSleep" },
  kill: { label: "Roll Kill", icon: "fas fa-skull", action: "takeKill" },
  // Hack buttons
  arm: { label: "Hack Arm", icon: "fas fa-hand", action: "takeHack", data: "arm" },
  leg: { label: "Hack Leg", icon: "fas fa-boot", action: "takeHack", data: "leg" },
  body: { label: "Hack Body", icon: "fas fa-kidneys", action: "takeHack", data: "body" },
  eye: { label: "Hack Eye", icon: "fas fa-eye", action: "takeHack", data: "eye" },
  ear: { label: "Hack Ear", icon: "fas fa-ear", action: "takeHack", data: "ear" },
  mouth: { label: "Hack Mouth", icon: "fas fa-lips", action: "takeHack", data: "mouth" },
  nose: { label: "Hack Nose", icon: "fas fa-nose", action: "takeHack", data: "nose" },
  // Status button templates
  startStatus: { icon: "fas fa-plus", action: "applyStatus" },
  endStatus: { icon: "fas fa-xmark", action: "removeStatus" },
};

/**
 * @param {TeriockAbilityData} abilityData
 * @param {CommonRollOptions} options
 * @returns {Promise<void>}
 * @private
 */
export async function _roll(abilityData, options) {
  const { advantage = false, disadvantage = false } = options || {};
  const rawMessage = await abilityData.parent.buildMessage();
  const message = `<div class="teriock">${rawMessage}</div>`;
  const chatMessageData = {
    speaker: ChatMessage.getSpeaker({ actor: abilityData.parent.getActor() }),
    rolls: [],
  };

  const useData = await stageUse(abilityData, advantage, disadvantage);
  const buttons = await buildButtons(abilityData, useData);
  const targets = getTargets(abilityData);

  // Generate rolls based on interaction type
  const rollGenerators = {
    attack: () => generateRolls(abilityData, useData, options, targets, message, buttons, _generateAttackRoll),
    feat: () => generateRolls(abilityData, useData, options, targets, message, buttons, _generateFeatRoll, false),
    manifest: () => generateRolls(abilityData, useData, options, targets, message, buttons, _generateFeatRoll, true),
    block: () => generateRolls(abilityData, useData, options, targets, message, buttons, _generateFeatRoll, true),
  };

  const generator = rollGenerators[abilityData.interaction];
  if (generator) {
    chatMessageData.rolls = await generator();

    // Handle attack penalty
    if (abilityData.interaction === "attack") {
      const actor = abilityData.parent.getActor();
      await actor.update({ "system.attackPenalty": actor.system.attackPenalty - 3 });
    }
  }

  // Evaluate and create chat message
  for (const roll of chatMessageData.rolls) {
    await roll.evaluate();
  }
  await foundry.documents.ChatMessage.create(chatMessageData);
}

/**
 * Build buttons for the roll
 */
async function buildButtons(abilityData, useData) {
  const buttons = [];

  // Feat save button
  if (abilityData.interaction === "feat") {
    const featSaveAttr = abilityData.featSaveAttribute?.toUpperCase?.() || "SAVE";
    buttons.push({
      ...BUTTON_CONFIGS.feat,
      label: `Roll ${featSaveAttr} Save`,
      data: abilityData.featSaveAttribute,
    });
  }

  // Effect button
  const effectData = await _generateEffect(abilityData, abilityData.parent.getActor(), useData.modifiers.heightened);
  if (effectData) {
    buttons.push({
      ...BUTTON_CONFIGS.effect,
      data: JSON.stringify(effectData),
    });
  }

  // Resistance button
  if (abilityData.effects?.includes("resistance")) {
    buttons.push(BUTTON_CONFIGS.resistance);
  }

  // Take buttons
  const takeData = await _generateTakes(abilityData, useData.modifiers.heightened);
  Object.entries(takeData.rolls).forEach(([key, value]) => {
    if (value && BUTTON_CONFIGS[key]) {
      const buttonConfig = BUTTON_CONFIGS[key];
      buttonConfig.icon = getRollIcon(value);
      buttons.push({ ...buttonConfig, data: value, tooltip: value });
    }
  });

  // Hack buttons
  for (const hackType of takeData.hacks) {
    if (BUTTON_CONFIGS[hackType]) {
      buttons.push({ ...BUTTON_CONFIGS[hackType] });
    }
  }

  // Status buttons
  if (takeData.startStatuses && takeData.startStatuses.size > 0) {
    for (const status of takeData.startStatuses) {
      const statusName = CONFIG.TERIOCK.conditions[status];
      buttons.push({
        ...BUTTON_CONFIGS.startStatus,
        label: statusName,
        data: status,
      });
    }
  }
  if (takeData.endStatuses && takeData.endStatuses.size > 0) {
    for (const status of takeData.endStatuses) {
      const statusName = CONFIG.TERIOCK.conditions[status];
      buttons.push({
        ...BUTTON_CONFIGS.endStatus,
        label: statusName,
        data: status,
      });
    }
  }

  // Tradecraft check buttons
  for (const check of takeData.checks) {
    buttons.push({
      ...BUTTON_CONFIGS.tradecraft,
      label: `${CONFIG.TERIOCK.tradecraftOptionsList[check]} Check`,
      data: check,
    });
  }

  return buttons;
}

/**
 * Get targets, handling self-targeting logic
 */
function getTargets(abilityData) {
  let targets = Array.from(game.user.targets);
  const targetsSelf = abilityData.targets?.length === 1 && abilityData.targets[0] === "self";
  const includesSelf = abilityData.targets?.includes("self");

  if (targetsSelf || (includesSelf && targets.length === 0)) {
    const actor = abilityData.parent.getActor();
    const activeToken = actor.getActiveTokens?.()?.[0];
    const tokenName = actor.token?.name || activeToken?.name || actor.prototypeToken?.name || actor.name;
    const tokenActorSrc = actor.token?.actor?.token?.texture?.src;
    const activeTokenSrc = activeToken?.actor?.token?.texture?.src;
    const prototypeSrc = actor.prototypeToken?.texture?.src;
    const tokenImg = actor.token?.texture?.src || tokenActorSrc || activeTokenSrc || prototypeSrc || actor.img;
    const token = actor.token || activeToken || actor.prototypeToken || null;
    targets = [
      {
        name: tokenName,
        actor: actor,
        img: tokenImg,
        uuid: token?.document?.uuid || actor.uuid,
      },
    ];
  }

  return targets;
}

/**
 * Generate rolls for multiple targets
 */
async function generateRolls(abilityData, useData, options, targets, message, buttons, rollGenerator, noDice = false) {
  const rolls = [];

  if (targets.length === 0) {
    const rollOptions = { ...options, message, buttons, noDice };
    const roll = await rollGenerator(abilityData, useData, rollOptions);
    rolls.push(roll);
  } else {
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const isLastRoll = i === targets.length - 1;
      const rollOptions = {
        ...options,
        target,
        message: i === 0 ? message : null,
        buttons: isLastRoll ? buttons : [],
        noDice,
      };
      const roll = await rollGenerator(abilityData, useData, rollOptions);
      rolls.push(roll);
    }
  }

  return rolls;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {boolean} advantage
 * @param {boolean} disadvantage
 * @returns {Promise<object>}
 */
async function stageUse(abilityData, advantage, disadvantage) {
  const useData = {
    costs: { mp: 0, hp: 0 },
    modifiers: { heightened: 0 },
    formula: "",
    rollData: abilityData.parent.getActor().getRollData(),
  };

  // Calculate costs
  useData.costs.mp = await calculateCost(abilityData.costs.mp, useData.rollData);
  useData.costs.hp = await calculateCost(abilityData.costs.hp, useData.rollData);

  // Build initial formula
  useData.formula = buildInitialFormula(abilityData, advantage, disadvantage);

  // Handle dialogs for variable costs and heightened
  await handleDialogs(abilityData, useData);

  // Add proficiency modifiers
  if (["attack", "feat"].includes(abilityData.interaction)) {
    if (abilityData.isFluent) useData.formula += " + @f";
    else if (abilityData.isProficient) useData.formula += " + @p";
    if (useData.modifiers.heightened > 0) useData.formula += " + @h";
  }

  return useData;
}

/**
 * Calculate cost based on type
 */
async function calculateCost(costConfig, rollData) {
  if (!costConfig) return 0;

  switch (costConfig.type) {
    case "static":
      return costConfig.value.static;
    case "formula":
      return await evaluateAsync(costConfig.value.formula, rollData);
    default:
      return 0;
  }
}

/**
 * Build initial roll formula
 */
function buildInitialFormula(abilityData, advantage, disadvantage) {
  if (abilityData.interaction === "attack") {
    let formula = advantage ? "2d20kh1" : disadvantage ? "2d20kl1" : "1d20";
    formula += " + @atkPen + @av0";
    if (abilityData.delivery.base === "weapon") formula += " + @sb";
    return formula;
  }
  return abilityData.interaction === "feat" ? "10" : "0";
}

/**
 * Handle dialogs for variable costs and heightened
 */
async function handleDialogs(abilityData, useData) {
  const dialogs = [];
  const actor = abilityData.parent.getActor();

  // Variable MP cost dialog
  if (abilityData.costs.mp?.type === "variable") {
    const mpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.mp.value.variable);
    const maxMp = actor.system.mp.value - actor.system.mp.min;
    dialogs.push(createDialogFieldset("Variable Mana Cost", mpDescription, "mp", maxMp));
  }

  // Variable HP cost dialog
  if (abilityData.costs.hp?.type === "variable") {
    const hpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.hp.value.variable);
    const maxHp = actor.system.hp.value - actor.system.hp.min;
    dialogs.push(createDialogFieldset("Variable Hit Point Cost", hpDescription, "hp", maxHp));
  }

  // Heightened dialog
  if (abilityData.isProficient && abilityData.heightened) {
    const p = actor.system.p;
    const heightenedDescription = await ux.TextEditor.enrichHTML(abilityData.heightened);
    dialogs.push(createDialogFieldset("Heightened Amount", heightenedDescription, "heightened", p));
  }

  if (dialogs.length > 0) {
    const action = abilityData.spell ? "Casting" : "Executing";
    const title = `${action} ${abilityData.parent.name}`;
    await api.DialogV2.prompt({
      window: { title },
      content: dialogs.join(""),
      ok: {
        label: "Confirm",
        callback: (event, button) => {
          if (abilityData.costs.mp?.type === "variable") {
            useData.costs.mp = button.form.elements.mp.valueAsNumber;
          }
          if (abilityData.costs.hp?.type === "variable") {
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
}

/**
 * Create dialog fieldset
 */
function createDialogFieldset(legend, description, name, max) {
  return `<fieldset><legend>${legend}</legend>
    <div>${description}</div>
    <input type="number" name="${name}" value="0" min="0" max="${max}" step="1"></input>
  </fieldset>`;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {object} useData
 * @param {CommonRollOptions} options
 * @returns {Promise<TeriockRoll>}
 * @private
 */
export async function _generateAttackRoll(abilityData, useData, options = {}) {
  const { advantage = false, disadvantage = false, target = null, message = null, buttons = [] } = options;

  // Build roll formula
  let rollFormula = buildAttackFormula(abilityData, advantage, disadvantage, useData);

  // Prepare roll data
  const rollData = { ...useData.rollData, av0: 0, h: useData.modifiers.heightened || 0 };

  // Handle piercing and properties
  const { diceClass, diceTooltip, unblockable } = getPiercingInfo(abilityData, rollData);

  // Build context
  const context = buildRollContext(abilityData, target, buttons, diceClass, diceTooltip, unblockable);

  return new TeriockRoll(rollFormula, rollData, { context, message });
}

/**
 * Build attack roll formula
 */
function buildAttackFormula(abilityData, advantage, disadvantage, useData) {
  let formula = "";

  if (abilityData.effects?.includes("resistance")) {
    formula = advantage ? "2d20kh1" : disadvantage ? "2d20kl1" : "1d20";
  } else if (abilityData.interaction === "attack") {
    formula = advantage ? "2d20kh1" : disadvantage ? "2d20kl1" : "1d20";
    formula += " + @atkPen + @av0";
    if (abilityData.delivery.base === "weapon") formula += " + @sb";
  } else if (abilityData.interaction === "feat") {
    formula = "10";
  } else {
    formula = "0";
  }

  // Add proficiency modifiers
  if (["attack", "feat"].includes(abilityData.interaction) || abilityData.effects?.includes("resistance")) {
    if (abilityData.isFluent) formula += " + @f";
    else if (abilityData.isProficient) formula += " + @p";
    if (useData.modifiers.heightened > 0) formula += " + @h";
  }

  return formula;
}

/**
 * Get piercing information
 */
function getPiercingInfo(abilityData, rollData) {
  let diceClass,
    diceTooltip,
    unblockable = false;

  if (abilityData.delivery.base === "weapon") {
    const actor = abilityData.parent.getActor();
    const properties = actor.system.primaryAttacker?.effectKeys?.property || new Set();
    if (properties.has("av0") || actor?.system.piercing === "av0") {
      rollData.av0 = 2;
    }
    if (properties.has("ub") || actor?.system.piercing === "ub") {
      diceClass = "ub";
      diceTooltip = "Unblockable";
      rollData.av0 = 2;
      unblockable = true;
    }
  }

  if (abilityData.piercing === "av0") rollData.av0 = 2;
  if (abilityData.piercing === "ub") {
    diceClass = "ub";
    diceTooltip = "Unblockable";
    rollData.av0 = 2;
    unblockable = true;
  }

  return { diceClass, diceTooltip, unblockable };
}

/**
 * Build roll context
 */
function buildRollContext(abilityData, target, buttons, diceClass, diceTooltip, unblockable) {
  const context = { diceClass, diceTooltip, buttons };

  if (abilityData.effects?.includes("resistance")) {
    Object.assign(context, {
      diceClass: "resist",
      diceTooltip: "",
      isResistance: true,
      threshold: 10,
    });
  }

  if (abilityData.elderSorcery) {
    Object.assign(context, {
      elderSorceryElements: abilityData.elements,
      elderSorceryIncant: abilityData.elderSorceryIncant,
      isElderSorcery: true,
    });
  }

  if (target) {
    Object.assign(context, {
      targetName: target.name,
      targetImg: target.actor.token?.texture?.src,
      threshold: unblockable ? target.actor.system.ac : target.actor.system.cc,
      targetUuid: target.actor.uuid,
    });
  }

  return context;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {object} useData
 * @param {CommonRollOptions} options
 * @returns {Promise<TeriockRoll>}
 * @private
 */
export async function _generateFeatRoll(abilityData, useData, options = {}) {
  const { target = null, message = null, buttons = [], noDice = false } = options;

  // Build roll formula
  let rollFormula = "10";
  if (abilityData.isFluent) rollFormula += " + @f";
  else if (abilityData.isProficient) rollFormula += " + @p";
  if (useData.modifiers.heightened > 0) rollFormula += " + @h";

  // Prepare roll data
  const rollData = { ...useData.rollData, h: useData.modifiers.heightened || 0 };

  const actor = abilityData.parent.getActor();
  const activeToken = actor.getActiveTokens?.()?.[0];
  const tokenName = actor.token?.name || activeToken?.name || actor.prototypeToken?.name || actor.name;
  const tokenActorSrc = actor.token?.actor?.token?.texture?.src;
  const activeTokenSrc = activeToken?.actor?.token?.texture?.src;
  const prototypeSrc = actor.prototypeToken?.texture?.src;
  const tokenImg = actor.token?.texture?.src || tokenActorSrc || activeTokenSrc || prototypeSrc || actor.img;

  // Build context
  const context = {
    buttons,
    diceClass: "feat",
    totalClass: "feat",
    ...(noDice && { noDice: true }),
    ...(abilityData.elderSorcery && {
      elderSorceryElements: abilityData.elements,
      elderSorceryIncant: abilityData.elderSorceryIncant,
      isElderSorcery: true,
    }),
    ...(target && {
      targetName: tokenName,
      targetImg: tokenImg,
      targetUuid: target.actor.uuid,
    }),
  };

  return new TeriockRoll(rollFormula, rollData, { context, message });
}
