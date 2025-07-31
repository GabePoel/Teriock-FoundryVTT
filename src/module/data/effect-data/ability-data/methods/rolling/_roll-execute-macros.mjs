import TeriockMessage from "../../../../../documents/chat-message.mjs";
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
      const macro = await game.teriock.api.utils.fromUuid(pureUuid(safeUuid));
      if (macro) {
        try {
          await macro.execute({
            actor: rollConfig.abilityData.actor,
            speaker: TeriockMessage.getSpeaker({
              actor: rollConfig.abilityData.actor,
            }),
            args: [rollConfig],
            useData: rollConfig.useData,
            abilityData: rollConfig.abilityData,
            chatData: rollConfig.chatData,
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
  await rollConfig.abilityData.actor.hookCall("useAbility", rollConfig);
}
