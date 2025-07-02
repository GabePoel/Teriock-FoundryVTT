/** @import { CommonRollOptions } from "../../../../types/rolls"; */
/** @import TeriockAbilityData from "../ability-data.mjs"; */
const { api, ux } = foundry.applications;
import TeriockRoll from "../../../../documents/roll.mjs";
import { _generateEffect, _generateTakes } from "./_generate-effect.mjs";
import { evaluateAsync, getRollIcon } from "../../../../helpers/utils.mjs";

/**
 * Button configurations for different roll types.
 * Defines labels, icons, and actions for various ability roll buttons.
 * @type {object}
 * @private
 */
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
  awaken: { label: "Awaken", icon: "fas fa-sunrise", action: "takeAwaken" },
  revive: { label: "Revive", icon: "fas fa-heart-pulse", action: "takeRevive" },
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
 * Extracts token information from a target.
 * Gets name, actor, and image from the target's token or actor data.
 * @param {object} target - The target to extract token information from.
 * @returns {object} Object containing token name, actor, and image.
 * @private
 */
function tokenFromTarget(target) {
  const actor = target.actor;
  const img =
    target.texture?.src ||
    actor.token?.texture?.src ||
    actor.getActiveTokens()[0]?.texture?.src ||
    actor.prototypeToken?.texture?.src ||
    actor.img;
  const name = target.name || actor.token?.name || actor.prototypeToken?.name || actor.name;
  return {
    name,
    actor,
    img,
  };
}

/**
 * Initiates an ability roll with the specified options.
 * Handles cost calculation, resource spending, and roll generation based on interaction type.
 * @param {TeriockAbilityData} abilityData - The ability data to roll for.
 * @param {CommonRollOptions} options - Options for the ability roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll is complete.
 * @private
 */
export async function _roll(abilityData, options) {
  const { advantage = false, disadvantage = false } = options || {};
  const useData = await stageUse(abilityData, advantage, disadvantage);
  let rawMessage = await abilityData.parent.buildMessage();

  // Compute variable MP/HP spent (only if type is variable)
  const mpSpent = useData.costs.mp;
  const hpSpent = useData.costs.hp;
  const heightened = useData.modifiers.heightened || 0;

  // Subtract MP/HP costs from actor
  const actor = abilityData.parent.getActor();
  if (mpSpent > 0) {
    const newMp = Math.max(actor.system.mp.value - mpSpent, actor.system.mp.min ?? 0);
    await actor.update({ "system.mp.value": newMp });
  }
  if (hpSpent > 0) {
    const newHp = Math.max(actor.system.hp.value - hpSpent, actor.system.hp.min ?? 0);
    await actor.update({ "system.hp.value": newHp });
  }

  // Determine if we should add the bottom bar class
  const buttons = await buildButtons(abilityData, useData);
  const targets = getTargets(abilityData);
  let shouldBottomBar = true;
  if (
    buttons.length === 0 &&
    !["feat", "attack"].includes(abilityData.interaction) &&
    (!targets || targets.length === 0)
  ) {
    shouldBottomBar = false;
  }

  // If heightened or variable costs, append the summary bar box
  if (heightened > 0 || mpSpent > 0 || hpSpent > 0) {
    const summaryBarBox = createSummaryBarBox({ heightened, mpSpent, hpSpent, shouldBottomBar });
    if (summaryBarBox) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawMessage;
      tempDiv.appendChild(summaryBarBox);
      rawMessage = tempDiv.innerHTML;
    }
  }

  const message = `<div class="teriock">${rawMessage}</div>`;
  const chatMessageData = {
    speaker: ChatMessage.getSpeaker({ actor: abilityData.parent.getActor() }),
    rolls: [],
  };

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
  foundry.documents.ChatMessage.applyRollMode(chatMessageData, game.settings.get("core", "rollMode"));

  await foundry.documents.ChatMessage.create(chatMessageData);
}

/**
 * Builds buttons for the ability roll based on the ability's effects and takes.
 * Creates buttons for feat saves, effects, resistance, and various take actions.
 * @param {TeriockAbilityData} abilityData - The ability data to build buttons for.
 * @param {object} useData - The use data containing costs and modifiers.
 * @returns {Promise<Array>} Promise that resolves to an array of button configurations.
 * @private
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

  // Awaken button
  if (abilityData.effects?.includes("awakening")) {
    buttons.push(BUTTON_CONFIGS.awaken);
  }

  // Revive button
  if (abilityData.effects?.includes("revival")) {
    buttons.push(BUTTON_CONFIGS.revive);
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
 * Gets targets for the ability, handling self-targeting logic.
 * Returns array of targets or creates self-target if ability targets self.
 * @param {TeriockAbilityData} abilityData - The ability data to get targets for.
 * @returns {Array} Array of target objects.
 * @private
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
 * Generates rolls for multiple targets or single roll if no targets.
 * Handles roll generation for different interaction types.
 * @param {TeriockAbilityData} abilityData - The ability data to generate rolls for.
 * @param {object} useData - The use data containing costs and modifiers.
 * @param {CommonRollOptions} options - Options for the roll.
 * @param {Array} targets - Array of targets for the roll.
 * @param {string} message - The message to include with the roll.
 * @param {Array} buttons - Array of buttons for the roll.
 * @param {Function} rollGenerator - Function to generate individual rolls.
 * @param {boolean} noDice - Whether to generate rolls without dice.
 * @returns {Promise<Array>} Promise that resolves to an array of rolls.
 * @private
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
 * Stages the use of an ability, calculating costs and handling dialogs.
 * Prepares use data including costs, modifiers, and roll formula.
 * @param {TeriockAbilityData} abilityData - The ability data to stage use for.
 * @param {boolean} advantage - Whether the roll has advantage.
 * @param {boolean} disadvantage - Whether the roll has disadvantage.
 * @returns {Promise<object>} Promise that resolves to the use data object.
 * @private
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
  useData.formula = buildFormula(abilityData, advantage, disadvantage);

  // Handle dialogs for variable costs and heightened
  await handleDialogs(abilityData, useData);

  // Add proficiency modifiers
  if (["attack", "feat"].includes(abilityData.interaction)) {
    if (abilityData.parent.isFluent) useData.formula += " + @f";
    else if (abilityData.parent.isProficient) useData.formula += " + @p";
    if (useData.modifiers.heightened > 0) useData.formula += " + @h";
  }

  return useData;
}

/**
 * Calculates cost based on cost configuration type.
 * Handles static, formula, and variable cost types.
 * @param {object} costConfig - The cost configuration to calculate.
 * @param {object} rollData - The roll data for formula evaluation.
 * @returns {Promise<number>} Promise that resolves to the calculated cost.
 * @private
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
 * Builds the roll formula based on interaction type and advantage/disadvantage.
 * @param {TeriockAbilityData} abilityData - The ability data to build formula for.
 * @param {boolean} advantage - Whether the roll has advantage.
 * @param {boolean} disadvantage - Whether the roll has disadvantage.
 * @returns {string} The initial roll formula.
 * @private
 */
function buildFormula(abilityData, advantage, disadvantage) {
  let formula;
  if (abilityData.interaction === "attack") {
    formula = advantage ? "2d20kh1" : disadvantage ? "2d20kl1" : "1d20";
    formula += " + @atkPen";
    if (abilityData.delivery.base === "weapon") {
      formula += " + @av0 + @sb";
    } else {
      formula += " + @av0.abi";
    }
  } else if (abilityData.interaction === "feat") {
    formula = "10";
  } else {
    formula = "0";
  }
  return formula;
}

/**
 * Handles dialogs for variable costs and heightened effects.
 * Prompts user for variable MP/HP costs and heightened amounts.
 * @param {TeriockAbilityData} abilityData - The ability data to handle dialogs for.
 * @param {object} useData - The use data to update with dialog results.
 * @returns {Promise<void>} Promise that resolves when dialogs are handled.
 * @private
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
  if (abilityData.parent.isProficient && abilityData.heightened) {
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
          if (abilityData.parent.isProficient && abilityData.heightened) {
            useData.modifiers.heightened = button.form.elements.heightened.valueAsNumber;
            useData.costs.mp += useData.modifiers.heightened;
          }
        },
      },
    });
  }
}

/**
 * Creates a dialog fieldset for user input.
 * @param {string} legend - The legend text for the fieldset.
 * @param {string} description - The description text for the field.
 * @param {string} name - The name attribute for the input field.
 * @param {number} max - The maximum value for the number input.
 * @returns {string} HTML string for the dialog fieldset.
 * @private
 */
function createDialogFieldset(legend, description, name, max) {
  return `<fieldset><legend>${legend}</legend>
    <div>${description}</div>
    <input type="number" name="${name}" value="0" min="0" max="${max}" step="1"></input>
  </fieldset>`;
}

/**
 * Generates an attack roll for an ability.
 * Handles attack formula construction, piercing, and target information.
 * @param {TeriockAbilityData} abilityData - The ability data to generate attack roll for.
 * @param {object} useData - The use data containing costs and modifiers.
 * @param {CommonRollOptions} options - Options for the attack roll.
 * @returns {Promise<TeriockRoll>} Promise that resolves to the attack roll.
 * @private
 */
export async function _generateAttackRoll(abilityData, useData, options = {}) {
  const { advantage = false, disadvantage = false, target = null, message = null, buttons = [] } = options;

  // Build roll formula
  // let rollFormula = buildAttackFormula(abilityData, advantage, disadvantage, useData);

  // Prepare roll data
  const rollData = { ...useData.rollData, h: useData.modifiers.heightened || 0 };

  // Handle piercing and properties
  const { diceClass, diceTooltip, unblockable } = getPiercingInfo(abilityData, rollData);
  console.log("rollData", rollData);

  // Build context
  const context = buildRollContext(abilityData, target, buttons, diceClass, diceTooltip, unblockable);
  console.log(useData.formula);

  return new TeriockRoll(useData.formula, rollData, { context, message });
}

/**
 * Builds the attack roll formula based on ability type and effects.
 * @param {TeriockAbilityData} abilityData - The ability data to build formula for.
 * @param {boolean} advantage - Whether the roll has advantage.
 * @param {boolean} disadvantage - Whether the roll has disadvantage.
 * @param {object} useData - The use data containing modifiers.
 * @returns {string} The attack roll formula.
 * @private
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
    if (abilityData.parent.isFluent) formula += " + @f";
    else if (abilityData.parent.isProficient) formula += " + @p";
    if (useData.modifiers.heightened > 0) formula += " + @h";
  }

  return formula;
}

/**
 * Gets piercing information for the ability.
 * Determines if the ability has piercing properties and updates roll data accordingly.
 * @param {TeriockAbilityData} abilityData - The ability data to get piercing info for.
 * @param {object} rollData - The roll data to update with piercing information.
 * @returns {object} Object containing dice class, tooltip, and unblockable status.
 * @private
 */
function getPiercingInfo(abilityData, rollData) {
  let diceClass,
    diceTooltip,
    unblockable = false;

  if (abilityData.piercing === "av0" || abilityData.piercing === "ub") {
    rollData["av0.abi"] = 2;
    rollData["av0"] = 2;
  }
  if (abilityData.piercing === "ub") {
    rollData["av0.abi"] = 2;
    rollData["av0"] = 2;
    rollData["ub.abi"] = 1;
    rollData["ub"] = 1;
  }

  if (rollData["ub"]) {
    diceClass = "ub";
    diceTooltip = "Unblockable";
    unblockable = true;
  }

  return { diceClass, diceTooltip, unblockable };
}

/**
 * Builds the roll context for the ability roll.
 * Includes target information, elder sorcery data, and resistance effects.
 * @param {TeriockAbilityData} abilityData - The ability data to build context for.
 * @param {object} target - The target for the roll.
 * @param {Array} buttons - Array of buttons for the roll.
 * @param {string} diceClass - The CSS class for the dice.
 * @param {string} diceTooltip - The tooltip for the dice.
 * @param {boolean} unblockable - Whether the roll is unblockable.
 * @returns {object} The roll context object.
 * @private
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

  const targetInfo = target ? tokenFromTarget(target) : null;
  const tokenName = targetInfo?.name || "";
  const tokenImg = targetInfo?.img || "";

  if (target) {
    Object.assign(context, {
      targetName: tokenName,
      targetImg: tokenImg,
      threshold: unblockable ? target.actor.system.ac : target.actor.system.cc,
      targetUuid: target.actor.uuid,
    });
  }

  return context;
}

/**
 * Generates a feat roll for an ability.
 * Creates a feat roll with proficiency modifiers and target information.
 * @param {TeriockAbilityData} abilityData - The ability data to generate feat roll for.
 * @param {object} useData - The use data containing costs and modifiers.
 * @param {CommonRollOptions} options - Options for the feat roll.
 * @returns {Promise<TeriockRoll>} Promise that resolves to the feat roll.
 * @private
 */
export async function _generateFeatRoll(abilityData, useData, options = {}) {
  const { target = null, message = null, buttons = [], noDice = false } = options;

  // Build roll formula
  let rollFormula = "10";
  if (abilityData.parent.isFluent) rollFormula += " + @f";
  else if (abilityData.parent.isProficient) rollFormula += " + @p";
  if (useData.modifiers.heightened > 0) rollFormula += " + @h";

  // Prepare roll data
  const rollData = { ...useData.rollData, h: useData.modifiers.heightened || 0 };

  const targetInfo = target ? tokenFromTarget(target) : null;
  const tokenName = targetInfo?.name || "";
  const tokenImg = targetInfo?.img || "";

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
      targetUuid: target?.actor.uuid,
    }),
  };

  return new TeriockRoll(rollFormula, rollData, { context, message });
}

/**
 * Manually constructs a summary bar box DOM element for heightened/variable costs.
 * Creates a visual summary of costs and modifiers for the ability roll.
 * @param {object} params - Parameters containing heightened, mpSpent, hpSpent, and shouldBottomBar.
 * @returns {HTMLElement|null} The summary bar box element or null if no summary needed.
 * @private
 */
function createSummaryBarBox({ heightened, mpSpent, hpSpent, shouldBottomBar }) {
  const labels = [];
  if (heightened > 0) labels.push(`Heightened ${heightened} Time${heightened === 1 ? "" : "s"}`);
  if (mpSpent > 0) labels.push(`${mpSpent} MP Spent`);
  if (hpSpent > 0) labels.push(`${hpSpent} HP Spent`);
  if (labels.length === 0) return null;

  const tmessage = document.createElement("div");
  tmessage.className = "tmessage" + (shouldBottomBar ? " tmessage-bottom-bar" : "");

  const barBox = document.createElement("div");
  barBox.className = "tmes-bar-box";
  const bar = document.createElement("div");
  bar.className = "abm-bar";
  const tags = document.createElement("div");
  tags.className = "abm-bar-tags";

  for (const label of labels) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "abm-label tsubtle";
    labelDiv.textContent = label;
    tags.appendChild(labelDiv);
  }

  bar.appendChild(tags);
  barBox.appendChild(bar);
  tmessage.appendChild(barBox);
  return tmessage;
}
