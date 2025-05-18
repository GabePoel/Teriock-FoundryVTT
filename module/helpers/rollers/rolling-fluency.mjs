import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollFluency(fluency, options) {
    await use(fluency, options);
}

async function use(fluency, options) {
    console.log('Rolling fluency', fluency);
    let message = await fluency.buildMessage();
    let rollFormula = '1d20';
    if (options?.advantage) {
        rollFormula += 'kh1';
    } else if (options?.disadvantage) {
        rollFormula += 'kl1';
    }
    rollFormula += ' + @f + @' + fluency.tradecraft;
    console.log('Roll formula', rollFormula);
    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, fluency.getActor()?.rollData(), { flavor: message });
    roll.toMessage({
        speaker: ChatMessage.getSpeaker({
            actor: fluency.getActor(),
        }),
    });
}