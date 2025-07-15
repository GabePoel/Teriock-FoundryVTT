import { evaluateAsync } from "../../../../../helpers/utils.mjs";
import { _buildButtons, _createSummaryBarBox } from "./_roll-chat-message.mjs";
import { _handleDialogs } from "./_roll-dialogs.mjs";
import { _generateRolls } from "./_roll-object-generation.mjs";
import { _getTargets, _measure } from "./_roll-targeting.mjs";

/**
 * Initiates an ability roll with the specified options.
 * Handles cost calculation, resource spending, and roll generation based on interaction type.
 *
 * @todo Finish modularizing and cleaning this up.
 * @param {TeriockAbilityData} abilityData - The data of the ability being rolled for.
 * @param {object} options - Options for the ability roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll is complete.
 * @private
 */
export async function _roll(abilityData, options) {
  if (!abilityData.actor) {
    ui.notifications.error("Abilities must be on an actor to be used.", { console: false });
    return;
  }

  /** @type {AbilityRollConfig} */
  const rollConfig = {
    useData: {
      rollOptions: options,
      costs: {
        hp: 0,
        mp: 0,
        gp: 0,
      },
      modifiers: {
        heightened: 0,
      },
      formula: "",
      rollData: {},
      targets: [],
    },
    abilityData: abilityData,
    chatData: {
      message: "",
      speaker: ChatMessage.getSpeaker({ actor: abilityData.actor }),
      rolls: [],
      buttons: [],
    },
  };

  await stageUse(rollConfig);
  let rawMessage = await abilityData.parent.buildMessage();

  // Compute variable MP/HP spent (only if type is variable)

  const mpSpent = rollConfig.useData.costs.mp;
  const hpSpent = rollConfig.useData.costs.hp;
  const gpSpent = rollConfig.useData.costs.gp;
  const heightened = rollConfig.useData.modifiers.heightened || 0;

  // Subtract MP/HP costs from actor

  const actor = abilityData.actor;
  if (mpSpent > 0) {
    const newMp = Math.max(actor.system.mp.value - mpSpent, actor.system.mp.min ?? 0);
    await actor.update({ "system.mp.value": newMp });
  }
  if (hpSpent > 0) {
    const newHp = Math.max(actor.system.hp.value - hpSpent, actor.system.hp.min ?? 0);
    await actor.update({ "system.hp.value": newHp });
  }
  if (gpSpent > 0) {
    await actor.takePay(gpSpent);
  }

  // Determine if we should add the bottom bar class
  const buttons = await _buildButtons(rollConfig);
  let targets = _getTargets(abilityData);

  const measureData = await _measure(abilityData);

  targets = measureData.targets || targets;
  rollConfig.useData.targets = targets;

  let shouldBottomBar = true;
  if (
    buttons.length === 0 &&
    !["feat", "attack"].includes(abilityData.interaction) &&
    (!targets || targets.length === 0)
  ) {
    shouldBottomBar = false;
  }

  // If heightened or variable costs, append the summary bar box
  if (heightened > 0 || mpSpent > 0 || hpSpent > 0 || gpSpent > 0) {
    const summaryBarBox = _createSummaryBarBox({ heightened, mpSpent, hpSpent, gpSpent, shouldBottomBar });
    if (summaryBarBox) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawMessage;
      tempDiv.appendChild(summaryBarBox);
      rawMessage = tempDiv.innerHTML;
    }
  }

  rollConfig.chatData.message = `<div class="teriock">${rawMessage}</div>`;
  rollConfig.chatData.buttons = buttons;

  if (abilityData.applies.macro) {
    /** @type {TeriockMacro} */
    const macro = await foundry.utils.fromUuid(abilityData.applies.macro);
    if (macro) {
      macro.execute({
        actor: abilityData.actor,
        useData: rollConfig.useData,
        abilityData: rollConfig.abilityData,
      });
    }
  }

  await _generateRolls(rollConfig);

  if (abilityData.interaction === "attack") {
    const actor = abilityData.actor;
    await actor.update({ "system.attackPenalty": actor.system.attackPenalty - 3 });
  }

  // Evaluate and create chat message
  for (const roll of rollConfig.chatData.rolls) {
    await roll.evaluate();
  }
  foundry.documents.ChatMessage.applyRollMode(rollConfig.chatData, game.settings.get("core", "rollMode"));

  await foundry.documents.ChatMessage.create(rollConfig.chatData);
}

/**
 * Stages the use of an ability, calculating costs and handling dialogs.
 * Prepares use data including costs, modifiers, and roll formula.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
async function stageUse(rollConfig) {
  rollConfig.useData.rollData = rollConfig.abilityData.actor.getRollData();

  // Calculate costs
  rollConfig.useData.costs.hp = await calculateCost(rollConfig.abilityData.costs.hp, rollConfig.useData.rollData);
  rollConfig.useData.costs.mp = await calculateCost(rollConfig.abilityData.costs.mp, rollConfig.useData.rollData);
  rollConfig.useData.costs.gp = await calculateCost(rollConfig.abilityData.costs.gp, rollConfig.useData.rollData);

  // Build initial formula
  rollConfig.useData.formula = buildFormula(rollConfig);

  // Handle dialogs for variable costs and heightened
  await _handleDialogs(rollConfig);

  // Add proficiency modifiers
  if (["attack", "feat"].includes(rollConfig.abilityData.interaction)) {
    if (rollConfig.abilityData.parent.isFluent) rollConfig.useData.formula += " + @f";
    else if (rollConfig.abilityData.parent.isProficient) rollConfig.useData.formula += " + @p";
    if (rollConfig.useData.modifiers.heightened > 0) rollConfig.useData.formula += " + @h";
  }
}

/**
 * Calculates cost based on cost configuration type.
 * Handles static, formula, and variable cost types.
 *
 * @param {NumberCost} costConfig - The cost configuration to calculate.
 * @param {object} rollData - The roll data for formula evaluation.
 * @returns {Promise<number>} Promise that resolves to the calculated cost.
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
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {string} The initial roll formula.
 */
function buildFormula(rollConfig) {
  const abilityData = rollConfig.abilityData;
  const advantage = rollConfig.useData.rollOptions.advantage;
  const disadvantage = rollConfig.useData.rollOptions.disadvantage;
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
