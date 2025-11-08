import { evaluateAsync, getToken } from "../../../../../helpers/utils.mjs";
import { _handleDialogs } from "./_roll-dialogs.mjs";

/**
 * Stages the use of an ability, calculating costs and handling dialogs.
 * Prepares use data including costs, modifiers, and roll formula.
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
export async function _stageUse(rollConfig) {
  rollConfig.useData.rollData = rollConfig.useData.actor.getRollData();
  rollConfig.useData.executor = getToken(rollConfig.useData.actor);
  rollConfig.useData.noTemplate =
    rollConfig.abilityData.impacts.base.noTemplate;

  // Calculate costs
  rollConfig.useData.costs.hp = await calculateCost(
    rollConfig.abilityData.costs.hp,
    rollConfig.useData.rollData,
  );
  rollConfig.useData.costs.mp = await calculateCost(
    rollConfig.abilityData.costs.mp,
    rollConfig.useData.rollData,
  );
  rollConfig.useData.costs.gp = await calculateCost(
    rollConfig.abilityData.costs.gp,
    rollConfig.useData.rollData,
  );

  // Check if known to be warded
  if (rollConfig.abilityData.warded) {
    rollConfig.useData.modifiers.warded = true;
    rollConfig.useData.rollData["warded.abi"] = 1;
    rollConfig.useData.rollData["warded"] = 1;
  }
  if (
    rollConfig.abilityData.interaction === "attack" &&
    rollConfig.abilityData.delivery.base === "weapon" &&
    rollConfig.useData.rollData["ward.wep"]
  ) {
    rollConfig.useData.modifiers.warded = true;
    rollConfig.useData.rollData["warded"] = 1;
  }

  // Build initial formula
  rollConfig.useData.formula = buildFormula(rollConfig);

  // Handle dialogs for variable costs and heightened
  await _handleDialogs(rollConfig);
  if (rollConfig.abilityData.adept.enabled) {
    rollConfig.useData.costs.mp =
      rollConfig.useData.costs.mp - rollConfig.abilityData.adept.amount;
  }
  if (rollConfig.abilityData.gifted.enabled) {
    rollConfig.useData.costs.mp =
      rollConfig.useData.costs.mp + rollConfig.abilityData.gifted.amount;
  }

  // Update the roll data
  rollConfig.useData.rollData["h"] = rollConfig.useData.modifiers.heightened;

  if (
    rollConfig.abilityData.piercing === "av0" ||
    rollConfig.abilityData.piercing === "ub"
  ) {
    rollConfig.useData.rollData["av0.abi"] = 2;
    rollConfig.useData.rollData["av0"] = 2;
  }
  if (rollConfig.abilityData.piercing === "ub") {
    rollConfig.useData.rollData["ub.abi"] = 1;
    rollConfig.useData.rollData["ub"] = 1;
  }

  // Add proficiency modifiers
  if (["attack", "feat"].includes(rollConfig.abilityData.interaction)) {
    if (rollConfig.useData.fluent) {
      rollConfig.useData.formula += " + @f";
      rollConfig.useData.noTemplate =
        rollConfig.useData.noTemplate ||
        rollConfig.abilityData.impacts.fluent.noTemplate;
    } else if (rollConfig.useData.proficient) {
      rollConfig.useData.formula += " + @p";
      rollConfig.useData.noTemplate =
        rollConfig.useData.noTemplate ||
        rollConfig.abilityData.impacts.proficient.noTemplate;
    }
    if (rollConfig.useData.modifiers.heightened > 0) {
      rollConfig.useData.formula += " + @h";
      rollConfig.useData.noTemplate =
        rollConfig.useData.noTemplate ||
        rollConfig.abilityData.impacts.heightened.noTemplate;
    }
  }
}

/**
 * Calculates cost based on cost configuration type.
 * Handles static, formula, and variable cost types.
 * @param {NumberCost} costConfig - The cost configuration to calculate.
 * @param {object} rollData - The roll data for formula evaluation.
 * @returns {Promise<number>} Promise that resolves to the calculated cost.
 */
async function calculateCost(costConfig, rollData) {
  if (!costConfig) {
    return 0;
  }

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
