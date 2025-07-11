import { _generateEffect, _generateTakes } from "../_generate-effect.mjs";
import { getRollIcon } from "../../../../../helpers/utils.mjs";

/**
 * Button configurations for different roll types.
 * @type {Record<string,ChatActionButton>}
 */
const BUTTON_CONFIGS = {
  feat: { label: "Roll SAVE Save", icon: "fas fa-dice-d20", action: "rollFeatSave" },
  effect: { label: "Apply Effect", icon: "fas fa-disease", action: "applyEffect" },
  resistance: { label: "Roll Resistance", icon: "fas fa-shield-alt", action: "rollResistance", data: "resistance" },
  tradecraft: { label: "Roll Tradecraft", icon: "fas fa-compass-drafting", action: "rollTradecraft" },
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
  arm: { label: "Hack Arm", icon: "fas fa-hand", action: "takeHack", data: "arm" },
  leg: { label: "Hack Leg", icon: "fas fa-boot", action: "takeHack", data: "leg" },
  body: { label: "Hack Body", icon: "fas fa-kidneys", action: "takeHack", data: "body" },
  eye: { label: "Hack Eye", icon: "fas fa-eye", action: "takeHack", data: "eye" },
  ear: { label: "Hack Ear", icon: "fas fa-ear", action: "takeHack", data: "ear" },
  mouth: { label: "Hack Mouth", icon: "fas fa-lips", action: "takeHack", data: "mouth" },
  nose: { label: "Hack Nose", icon: "fas fa-nose", action: "takeHack", data: "nose" },
  startStatus: { icon: "fas fa-plus", action: "applyStatus" },
  endStatus: { icon: "fas fa-xmark", action: "removeStatus" },
};

/**
 * Builds buttons for the ability roll based on the ability's effects and takes.
 * Creates buttons for feat saves, effects, resistance, and various take actions.
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<ChatActionButton[]>} Promise that resolves to an array of button configurations.
 * @private
 */
export async function _buildButtons(rollConfig) {
  const abilityData = rollConfig.abilityData;
  const useData = rollConfig.useData;
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
  const effectData = await _generateEffect(abilityData, abilityData.actor, useData.modifiers.heightened);
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
  const takeData = _generateTakes(abilityData, useData.modifiers.heightened);
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
 * Manually constructs a summary bar box DOM element for heightened/variable costs.
 * Creates a visual summary of costs and modifiers for the ability roll.
 * @param {object} params - Parameters containing heightened, mpSpent, hpSpent, and shouldBottomBar.
 * @returns {HTMLElement|null} The summary bar box element or null if no summary needed.
 * @private
 */
export function _createSummaryBarBox({ heightened, mpSpent, hpSpent, shouldBottomBar }) {
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
