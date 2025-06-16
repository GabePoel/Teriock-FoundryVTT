import TeriockRoll from "../../../documents/roll.mjs";

export async function _roll(fluency, options) {
  await use(fluency, options);
}

async function use(fluency, options) {
  let message = await fluency.buildMessage();
  let rollFormula = '1d20';
  if (options?.advantage) {
    rollFormula = '2d20kh1';
  } else if (options?.disadvantage) {
    rollFormula = '2d20kl1';
  }
  rollFormula += ' + @f + @' + fluency.system.tradecraft;
  message = await foundry.applications.ux.TextEditor.enrichHTML(message);
  const roll = new TeriockRoll(rollFormula, fluency.getActor()?.getRollData(), { message: message });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: fluency.getActor(),
    }),
  });
}