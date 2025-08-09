import { DEFAULT_ROLL_CONFIG } from "./_default-config.mjs";
import { _buildButtons } from "./_roll-build-buttons.mjs";
import { _buildChatMessage } from "./_roll-build-chat-message.mjs";
import { _buildTags } from "./_roll-build-tags.mjs";
import { _executeMacros } from "./_roll-execute-macros.mjs";
import { _generateRolls } from "./_roll-generate-rolls.mjs";
import { _payCosts } from "./_roll-pay-costs.mjs";
import { _setTargets } from "./_roll-set-targets.mjs";
import { _stageUse } from "./_roll-stage-use.mjs";

/**
 *
 * @param {TeriockAbilityData} abilityData
 * @param {Teriock.RollOptions.CommonRoll} options
 * @returns {Promise<void>}
 * @private
 */
export async function _roll(abilityData, options = {}) {
  const rollConfig = foundry.utils.deepClone(DEFAULT_ROLL_CONFIG);
  rollConfig.abilityData = abilityData;
  rollConfig.useData.rollOptions = options;
  rollConfig.useData.actor = abilityData?.actor;

  if (options.noHeighten) rollConfig.useData.modifiers.noHeighten = true;
  if (options.actor) rollConfig.useData.actor = options.actor;

  if (!rollConfig.useData.actor) {
    ui.notifications.error("Abilities must be on an actor to be used.", {
      console: false,
    });
    return;
  }

  await _setTargets(rollConfig);
  await _stageUse(rollConfig);
  await _payCosts(rollConfig);
  await _generateRolls(rollConfig);
  await _buildButtons(rollConfig);
  _buildTags(rollConfig);
  await _executeMacros(rollConfig, "preExecution");
  await _buildChatMessage(rollConfig);
  await _executeMacros(rollConfig, "execution");
}
