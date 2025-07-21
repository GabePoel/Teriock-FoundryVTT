import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * Initiates a resource roll with the specified options.
 *
 * @param {TeriockResourceData} resourceData - The resource data to roll for.
 * @param {Teriock.CommonRollOptions} options - Options for the roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll is complete.
 * @private
 */
export async function _roll(resourceData, options) {
  await use(resourceData, options);
}

/**
 * Performs the actual resource roll, creating a message with the roll result.
 * Handles advantage/disadvantage, function hooks, and fallback to chat if no roll formula.
 *
 * @param {TeriockResourceData} resourceData - The resource data to roll for.
 * @param {Teriock.CommonRollOptions} options - Options for the roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll message is sent.
 * @private
 */
async function use(resourceData, options) {
  let message = await resourceData.parent.buildMessage();
  if (resourceData.rollFormula) {
    let rollFormula = resourceData.rollFormula;

    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, resourceData.actor?.getRollData(), { message: message });

    if (options?.advantage) {
      roll.alter(2, 0);
    }

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: resourceData.actor,
      }),
    });
    const result = roll.total;
    const functionHook = resourceData.functionHook;
    if (functionHook) {
      const hookFunction = CONFIG.TERIOCK.resourceOptions.functionHooks[functionHook]?.callback;
      await hookFunction?.(resourceData.parent, result);
    }
  } else {
    await resourceData.parent.chat();
  }
}
