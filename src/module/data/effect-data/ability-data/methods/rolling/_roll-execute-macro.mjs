import TeriockChatMessage from "../../../../../documents/chat-message.mjs";

/**
 * If this ability has a macro, execute it.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
export async function _executeMacro(rollConfig) {
  if (rollConfig.abilityData.applies.macro) {
    /** @type {TeriockMacro} */
    const macro = await foundry.utils.fromUuid(rollConfig.abilityData.applies.macro);
    if (macro) {
      await macro.execute({
        actor: rollConfig.abilityData.actor,
        speaker: TeriockChatMessage.getSpeaker({ actor: rollConfig.abilityData.actor }),
        useData: rollConfig.useData,
        abilityData: rollConfig.abilityData,
        chatData: rollConfig.chatData,
      });
    }
  }
}
