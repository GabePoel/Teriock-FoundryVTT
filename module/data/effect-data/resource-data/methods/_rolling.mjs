/** @import TeriockResourceData from "../resource-data.mjs"; */
import TeriockRoll from "../../../../documents/roll.mjs";

/**
 * @param {TeriockResourceData} resourceData 
 * @param {object} options 
 */
export async function _roll(resourceData, options) {
  await use(resourceData, options);
}

/**
 * @param {TeriockResourceData} resourceData 
 * @param {object} options 
 */
async function use(resourceData, options) {
  let message = await resourceData.parent.buildMessage();
  if (resourceData.rollFormula) {
    let rollFormula = resourceData.rollFormula;

    if (options?.advantage) {
      rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
        const num = parseInt(dice) || 1;
        return (num * 2) + 'd' + sides;
      });
    }

    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, resourceData.parent.getActor()?.getRollData(), { message: message });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: resourceData.parent.getActor(),
      }),
    });
    const result = roll.total;
    console.log(`Rolled ${resourceData.parent.name} with result: ${result}`);
    const functionHook = resourceData.functionHook;
    if (functionHook) {
      const hookFunction = CONFIG.TERIOCK.resourceOptions.functionHooks[functionHook]?.callback;
      await hookFunction?.(resourceData.parent, result);
    }
  } else {
    resourceData.parent.chat();
  }
}