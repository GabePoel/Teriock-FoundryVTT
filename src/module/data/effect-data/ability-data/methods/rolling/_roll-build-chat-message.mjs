import TeriockChatMessage from "../../../../../documents/chat-message.mjs";
import { elderSorceryMask } from "../../../../../helpers/html.mjs";

/**
 * Build the chat message for the ability roll.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>} Promise that resolves to an array of button configurations.
 * @private
 */
export async function _buildChatMessage(rollConfig) {
  let content = await rollConfig.abilityData.parent.buildMessage();
  const element = document.createElement("div");
  element.innerHTML = content;
  if (rollConfig.useData.formula) {
    rollConfig.chatData.system.extraContent = element.outerHTML;
  }
  rollConfig.chatData.speaker = TeriockChatMessage.getSpeaker({
    actor: rollConfig.useData.actor,
  });
  TeriockChatMessage.applyRollMode(
    rollConfig.chatData,
    game.settings.get("core", "rollMode"),
  );
  for (const roll of rollConfig.chatData.rolls) {
    if (!roll._evaluated) {
      await roll.evaluate();
    }
  }
  rollConfig.chatData.system.overlay = elderSorceryMask(
    rollConfig.abilityData.parent,
  )?.outerHTML;
  rollConfig.chatData.system.source = rollConfig.abilityData.parent.uuid;
  await TeriockChatMessage.create(rollConfig.chatData);
}
