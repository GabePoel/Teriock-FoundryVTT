import { tokenFromTarget } from "./_roll-targeting.mjs";
import TeriockRoll from "../../../../../documents/roll.mjs";

const ROLL_GENERATORS = {
  attack: { generator: "attack", noDice: false },
  feat: { generator: "feat", noDice: false },
  manifest: { generator: "feat", noDice: true },
  block: { generator: "feat", noDice: true },
};

/**
 * Generate the roll used for this ability instance.
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<TeriockRoll[]>}
 */
export async function _generateRolls(rollConfig) {
  const generatorKey = ROLL_GENERATORS[rollConfig.abilityData.interaction].generator;
  const noDice = ROLL_GENERATORS[rollConfig.abilityData.interaction].noDice;
  if (generatorKey === "attack") {
    rollConfig.chatData.rolls = await generateRolls(rollConfig, _generateAttackRoll, noDice);
  } else if (generatorKey === "feat") {
    rollConfig.chatData.rolls = await generateRolls(rollConfig, _generateFeatRoll, noDice);
  }
}

/**
 * Generates rolls for multiple targets or single roll if no targets.
 * Handles roll generation for different interaction types.
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @param {Function} rollGenerator - Function to generate individual rolls.
 * @param {boolean} noDice - Whether to generate rolls without dice.
 * @returns {Promise<TeriockRoll[]>} Promise that resolves to an array of rolls.
 * @private
 */
async function generateRolls(rollConfig, rollGenerator, noDice) {
  const abilityData = rollConfig.abilityData;
  const useData = rollConfig.useData;
  const chatData = rollConfig.chatData;
  const options = useData.rollOptions;
  const targets = useData.targets;
  const message = chatData.message;
  const buttons = chatData.buttons;
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
 * Generates an attack roll for an ability.
 * Handles attack formula construction, piercing, and target information.
 * @param {TeriockAbilityData} abilityData - The ability data to generate attack roll for.
 * @param {object} useData - The use data containing costs and modifiers.
 * @param {CommonRollOptions} options - Options for the attack roll.
 * @returns {Promise<TeriockRoll>} Promise that resolves to the attack roll.
 * @private
 */
export async function _generateAttackRoll(abilityData, useData, options = {}) {
  const { target = null, message = null, buttons = [] } = options;

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
