import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * Initiates a fluency roll with the specified options.
 * @param {TeriockFluencyData} fluencyData - The fluency data to roll for.
 * @param {object} options - Options for the roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll is complete.
 * @private
 */
export async function _roll(fluencyData, options) {
  await use(fluencyData, options);
}

/**
 * Performs the actual fluency roll, creating a message with the roll result.
 * Handles advantage/disadvantage and applies tradecraft modifiers.
 * @param {TeriockFluencyData} fluencyData - The fluency data to roll for.
 * @param {object} options - Options for the roll including advantage/disadvantage.
 * @returns {Promise<void>} Promise that resolves when the roll message is sent.
 * @private
 */
async function use(fluencyData, options) {
  let message = await fluencyData.parent.buildMessage();
  let rollFormula = "1d20";
  if (options?.advantage) {
    rollFormula = "2d20kh1";
  } else if (options?.disadvantage) {
    rollFormula = "2d20kl1";
  }
  rollFormula += " + @f + @" + fluencyData.tradecraft;
  message = await foundry.applications.ux.TextEditor.enrichHTML(message);
  const roll = new TeriockRoll(rollFormula, fluencyData.actor.getRollData(), { message: message });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: fluencyData.actor,
    }),
  });
}
