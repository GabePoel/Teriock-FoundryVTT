/** @import { FluencyRollOptions } from "../../../../types/rolls"; */
/** @import TeriockFluencyData from "../fluency-data.mjs"; */
import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * @param {TeriockFluencyData} fluencyData 
 * @param {FluencyRollOptions} options 
 * @returns {Promise<void>}
 * @private
 */
export async function _roll(fluencyData, options) {
  await use(fluencyData, options);
}

/**
 * @param {TeriockFluencyData} fluencyData 
 * @param {FluencyRollOptions} options 
 * @returns {Promise<void>}
 * @private
 */
async function use(fluencyData, options) {
  let message = await fluencyData.parent.buildMessage();
  let rollFormula = '1d20';
  if (options?.advantage) {
    rollFormula = '2d20kh1';
  } else if (options?.disadvantage) {
    rollFormula = '2d20kl1';
  }
  rollFormula += ' + @f + @' + fluencyData.tradecraft;
  message = await foundry.applications.ux.TextEditor.enrichHTML(message);
  const roll = new TeriockRoll(rollFormula, fluencyData.parent.getActor()?.getRollData(), { message: message });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: fluencyData.parent.getActor(),
    }),
  });
}