import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollFluency(fluency, options) {
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
    rollFormula += ' + @f + @' + fluency.tradecraft;
    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, fluency.getActor()?.getRollData(), { flavor: message });
    roll.toMessage({
        speaker: ChatMessage.getSpeaker({
            actor: fluency.getActor(),
        }),
    });
}