import TeriockChatMessage from "../../../../../documents/chat-message.mjs";
import { pureUuid } from "../../../../../helpers/utils.mjs";

/**
 * If this ability has a macro, execute it.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @param {string} pseudoHook - The pseudo-hook to execute macros for.
 * @returns {Promise<void>}
 */
export async function _executeMacros(rollConfig, pseudoHook) {
  const macroEntries =
    /** @type {Array<[Teriock.SafeUUID<TeriockMacro>, string]>} */ Object.entries(
      rollConfig.abilityData.applies.macros,
    );

  for (const [safeUuid, macroPseudoHook] of macroEntries) {
    if (macroPseudoHook === pseudoHook) {
      const macro = /** @type {TeriockMacro} */ await foundry.utils.fromUuid(
        pureUuid(safeUuid),
      );
      if (macro) {
        try {
          await macro.execute({
            actor: rollConfig.useData.actor,
            speaker: TeriockChatMessage.getSpeaker({
              actor: rollConfig.useData.actor,
            }),
            args: [rollConfig],
            useData: rollConfig.useData,
            abilityData: rollConfig.abilityData,
            chatData: rollConfig.chatData,
            data: { rollConfig },
          });
        } catch (error) {
          console.error(
            `Could not execute macro with UUID ${pureUuid(safeUuid)}.`,
            error,
          );
        }
      }
    }
  }
  const data = { rollConfig };
  await rollConfig.useData.actor.hookCall("useAbility", data);
}
