import { getRollIcon, safeUuid } from "../../../../../helpers/utils.mjs";
import { _generateEffect, _generateTakes } from "../_generate-effect.mjs";

/**
 * Builds buttons for the ability roll based on the ability's effects and takes.
 * Creates buttons for feat saves, effects, resistance, and various take actions.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<Teriock.HTMLButtonConfig[]>} Promise that resolves to an array of button configurations.
 * @private
 */
export async function _buildButtons(rollConfig) {
  const abilityData = rollConfig.abilityData;
  const useData = rollConfig.useData;
  const buttons = [];

  // Feat Save Button
  if (abilityData.interaction === "feat") {
    const attribute = abilityData.featSaveAttribute;
    buttons.push({
      label: `Roll ${attribute.toUpperCase()} Save`,
      icon: "fas fa-dice-d20",
      dataset: {
        action: "feat-save",
        attribute: attribute,
        dc: rollConfig.chatData.rolls[0].total,
      },
    });
  }

  // Apply Effect Button
  const normalEffectData = await _generateEffect(
    abilityData,
    abilityData.actor,
    useData.modifiers.heightened,
  );
  const normalEffectJSON = JSON.stringify(normalEffectData);
  const critEffectData = await _generateEffect(
    abilityData,
    abilityData.actor,
    useData.modifiers.heightened,
    true,
  );
  const critEffectJSON = JSON.stringify(critEffectData);
  if (normalEffectData || critEffectData) {
    buttons.push({
      label: "Apply Effect",
      icon: "fas fa-disease",
      dataset: {
        action: "apply-effect",
        normal: normalEffectJSON || critEffectJSON,
        crit: critEffectJSON || normalEffectJSON,
        sustaining: rollConfig.abilityData.sustained
          ? safeUuid(rollConfig.abilityData.parent.uuid)
          : "null",
      },
    });
  }

  // Standard Damage Button
  if (
    abilityData.applies.base.standardDamage ||
    (abilityData.parent.isProficient &&
      abilityData.applies.proficient.standardDamage) ||
    (abilityData.parent.isFluent && abilityData.applies.fluent.standardDamage)
  ) {
    buttons.push({
      label: "Standard Roll",
      icon: "fas fa-hammer-crash",
      dataset: {
        action: "standard-damage",
      },
    });
  }

  // Resistance Button
  if (Array(abilityData.effects)?.includes("resistance")) {
    buttons.push({
      label: "Roll Resistance",
      icon: "fas fa-shield-alt",
      dataset: {
        action: "resist",
      },
    });
  }

  // Awaken Button
  if (Array(abilityData.effects)?.includes("awakening")) {
    buttons.push({
      label: "Awaken",
      icon: "fas fa-sunrise",
      dataset: {
        action: "awaken",
      },
    });
  }

  // Revive Button
  if (Array(abilityData.effects)?.includes("revival")) {
    buttons.push({
      label: "Revive",
      icon: "fas fa-heart-pulse",
      dataset: {
        action: "revive",
      },
    });
  }

  // Take Data
  const takeData = _generateTakes(abilityData, useData.modifiers.heightened);

  // Rollable Take Buttons
  Object.entries(takeData.rolls).forEach(([rollType, formula]) => {
    if (formula && ROLL_BUTTON_CONFIGS[rollType]) {
      const buttonConfig = ROLL_BUTTON_CONFIGS[rollType];
      buttonConfig.icon = `fas fa-${getRollIcon(formula)}`;
      buttonConfig.dataset = {
        action: "roll-rollable-take",
        type: rollType,
        tooltip: formula,
        formula: formula,
      };
      buttons.push(buttonConfig);
    }
  });

  // Hack Buttons
  for (const hackType of takeData.hacks) {
    const buttonConfig = HACK_BUTTON_CONFIGS[hackType];
    buttonConfig.dataset = {
      action: "take-hack",
      part: hackType,
    };
    buttons.push(buttonConfig);
  }

  // Apply Condition Buttons
  for (const status of takeData.startStatuses) {
    buttons.push({
      label: `Apply ${CONFIG.TERIOCK.conditions[status]}`,
      icon: "fas fa-plus",
      dataset: {
        action: "apply-status",
        status: status,
      },
    });
  }

  // Remove Condition Buttons
  for (const status of takeData.endStatuses) {
    buttons.push({
      label: `Remove ${CONFIG.TERIOCK.conditions[status]}`,
      icon: "fas fa-xmark",
      dataset: {
        action: "remove-status",
        status: status,
      },
    });
  }

  // Tradecraft Check Buttons
  for (const tradecraft of takeData.checks) {
    buttons.push({
      label: `${CONFIG.TERIOCK.tradecraftOptionsList[tradecraft]} Check`,
      icon: "fas fa-compass-drafting",
      dataset: {
        action: "tradecraft-check",
        tradecraft: tradecraft,
      },
    });
  }

  rollConfig.chatData.system.buttons.push(...buttons);
}

/**
 * Button configurations for different rollable take types.
 *
 * @type {Record<string,Teriock.HTMLButtonConfig>}
 */
const ROLL_BUTTON_CONFIGS = {
  damage: { label: "Roll Damage", icon: "fas fa-heart" },
  drain: { label: "Roll Drain", icon: "fas fa-brain" },
  wither: { label: "Roll Wither", icon: "fas fa-hourglass-half" },
  heal: { label: "Roll Heal", icon: "fas fa-heart" },
  revitalize: { label: "Roll Revitalize", icon: "fas fa-heart" },
  setTempHp: { label: "Roll Temp HP", icon: "fas fa-heart" },
  setTempMp: { label: "Roll Temp MP", icon: "fas fa-brain" },
  gainTempHp: { label: "Roll Temp HP", icon: "fas fa-heart" },
  gainTempMp: { label: "Roll Temp MP", icon: "fas fa-brain" },
  sleep: { label: "Roll Sleep", icon: "fas fa-bed" },
  kill: { label: "Roll Kill", icon: "fas fa-skull" },
  pay: { label: "Roll Pay", icon: "fas fa-coin" },
};

/**
 * Button configurations for different hacks.
 *
 * @type {Record<string,Teriock.HTMLButtonConfig>}
 */
const HACK_BUTTON_CONFIGS = {
  arm: { label: "Hack Arm", icon: "fas fa-hand" },
  leg: { label: "Hack Leg", icon: "fas fa-boot" },
  body: { label: "Hack Body", icon: "fas fa-kidneys" },
  eye: { label: "Hack Eye", icon: "fas fa-eye" },
  ear: { label: "Hack Ear", icon: "fas fa-ear" },
  mouth: { label: "Hack Mouth", icon: "fas fa-lips" },
  nose: { label: "Hack Nose", icon: "fas fa-nose" },
};
