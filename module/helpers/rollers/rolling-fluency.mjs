import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollFluency(fluency, options) {
    await use(fluency);
}

async function use(fluency) {
    console.log('Rolling fluency', fluency);
    let message = await fluency.buildMessage();
    const rollFormula = '1d20 + @f + @' + fluency.tradecraft
    console.log('Roll formula', rollFormula);
    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, fluency.getActor()?.rollData(), { flavor: message });
    roll.toMessage({
        speaker: ChatMessage.getSpeaker({
            actor: fluency.getActor(),
        }),
    });
}